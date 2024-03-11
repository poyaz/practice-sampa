import { IImpressionService } from '@users-domain/impression-event.interface';
import { UsersModel } from '@users-domain/users.model';

export class EventService implements IImpressionService {
  private _likeCb: Array<{ key: string; cb: any }> = [];
  private _dislikeCb: Array<{ key: string; cb: any }> = [];

  likePublish(userId: string, by: UsersModel) {
    this._likeCb.filter((v) => v.key === userId).map((v) => v.cb(by));
  }

  likeSubscribe(userId: string, cb) {
    this._likeCb.push({ key: userId, cb: cb });
  }

  dislikePublish(userId: string, by: UsersModel) {
    this._dislikeCb.filter((v) => v.key === userId).map((v) => v.cb(by));
  }

  dislikeSubscribe(userId: string, cb) {
    this._dislikeCb.push({ key: userId, cb: cb });
  }

  disconnect(userId: string) {
    this._likeCb = this._likeCb.filter((v) => v.key !== userId);
    this._dislikeCb = this._dislikeCb.filter((v) => v.key !== userId);
  }
}
