import { Tag } from '../tag';
import { Speaker } from '../speaker';

export interface Gathering {
  _id: any;
  name: string;
  description: string;
  speakers: Speaker[];
  timeStart: Date;
  timeEnd: Date;
  timeSpanMinutes: number;
  tags: Tag[];
  createDate: Date;
}
