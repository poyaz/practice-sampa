import { UsersModel } from './users.model';
import { AsyncReturn } from '@common/type';
import { UpdateModel } from '@common/update.model';
import { FilterModel } from '@common/filter.model';

export interface IUserService {
  login(username: string, password: string): AsyncReturn<Error, string>;

  add(model: UsersModel): AsyncReturn<Error, UsersModel>;

  getById(id: string): AsyncReturn<Error, UsersModel>;

  like(id: string, likedUserId: string): AsyncReturn<Error, undefined>;

  dislike(id: string, dislikedUserId: string): AsyncReturn<Error, undefined>;

  feed(id: string): AsyncReturn<Error, Array<UsersModel>>;
}

export interface IUserRepository {
  getById(id: string): AsyncReturn<Error, UsersModel>;

  getAll(
    filter?: FilterModel<UsersModel>,
  ): AsyncReturn<Error, Array<UsersModel>>;

  add(model: UsersModel): AsyncReturn<Error, UsersModel>;

  addLike(userId: string, byUserId: string): AsyncReturn<Error, undefined>;

  addDislike(userId: string, byUserId: string): AsyncReturn<Error, undefined>;
}
