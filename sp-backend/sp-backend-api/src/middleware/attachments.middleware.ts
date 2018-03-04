import { S3 } from 'aws-sdk';
import { utc } from 'moment';
import * as uuid from 'uuid/v4';
import { getExtension } from 'mime';
import { logger, config } from '../helpers';
import { decodeUserFromHeaders } from '../services/auth';

const ALLOWED_EXTENSIONS = ['png', 'jpeg', 'gif'];

export function signS3Attachment(secretKey: string) {
  return async (req: any, res: any) => {
    const s3 = new S3();
    const fileName = req.body.name;
    const fileType = req.body.type;
    const fileSize = req.body.size;

    logger.info('Uploading File', {
      fileName,
      fileType,
      fileSize
    });

    const jwtFromAuth = req.header('Authorization') && req.header('Authorization').replace('Bearer ', '');
    const jwtFromCookie = req.cookies[config.cookieName];

    const user = decodeUserFromHeaders(secretKey, jwtFromAuth || jwtFromCookie);

    if (user) {
      return res.status(400).send({
        error: 'You must be logged in to upload images'
      });
    }

    if (fileSize > 10000000) {
      return res.status(400).send({
        error: 'This file is too large to upload'
      });
    }

    let extension = getExtension(fileType);
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return res.status(400).send({
        error: 'You may only upload images'
      });
    }
    if (extension === 'jpeg') {
      extension = 'jpg';
    }

    const newFileName = `${config.environment.substr(0, 1)}-${user.username}-${uuid()}.${extension}`;

    const s3Params = {
      Bucket: config.s3Bucket,
      Key: newFileName,
      Expires: 60,
      ContentType: fileType,
      ACL: 'public-read'
    };

    s3.getSignedUrl('putObject', s3Params, (err, data) => {
      if (err) {
        logger.error('Error Saving to S3', {
          err,
          message: err.message
        });
        return res.status(400).send({
          error: 'There was an error getting authorization to upload'
        });
      }
      const returnData = {
        signedRequest: data,
        fileName: newFileName,
        createdDate: utc().toISOString()
      };
      res.status(200).send(returnData);
    });
  };
}
