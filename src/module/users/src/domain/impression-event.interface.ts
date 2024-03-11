import { UsersModel } from '@users-domain/users.model';

export interface IImpressionService {
  likePublish(userId: string, by: UsersModel);

  likeSubscribe(userId: string, cb);

  dislikePublish(userId: string, by: UsersModel);

  dislikeSubscribe(userId: string, cb);

  disconnect(userId: string);
}
