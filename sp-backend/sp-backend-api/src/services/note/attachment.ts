import { ObjectId } from 'mongodb';

export default class Attachment {
  public _id: ObjectId;
  public id: string;
  public fileName: string;
  public isPrivate: boolean;
  public createdUserId: ObjectId;
  public createdDate: string;

  public constructor(init?: Partial<Attachment>) {
    if (init._id) {
      this.id = init._id.toHexString();
    }
    Object.assign(this, init);
  }
}
