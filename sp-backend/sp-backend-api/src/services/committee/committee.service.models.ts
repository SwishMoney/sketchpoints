import { User } from '../user';

export interface Committee {
  _id: any;
  name: string;
  members: User[];
  createDate: Date;
}
