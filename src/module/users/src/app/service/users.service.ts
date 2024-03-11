import { Injectable } from '@nestjs/common';
import { IUserRepository, IUserService } from '@users-domain/users.interface';
import { AsyncReturn } from '@common/type';
import { LocationModel, UsersModel } from '@users-domain/users.model';
import { UpdateModel } from '@common/update.model';
import { IIdentifierAdapter } from './adapter/identifier.adapter';
import * as bcrypt from 'bcrypt';
import { FilterModel } from '@common/filter.model';
import { AuthenticateException } from '@users-domain/errors/authenticate.exception';
import { getDistance } from 'geolib';
import { IImpressionService } from '@users-domain/impression-event.interface';

@Injectable()
export class UsersService implements IUserService {
  constructor(
    private readonly _usersRepository: IUserRepository,
    private _identifier: IIdentifierAdapter,
    private readonly _eventService: IImpressionService,
  ) {
  }

  async add(model: UsersModel): AsyncReturn<Error, UsersModel> {
    const userModel = model.clone();
    userModel.id = this._identifier.generateId();
    userModel.salt = await bcrypt.genSalt(10);
    userModel.password = await bcrypt.hash(model.password, userModel.salt);

    return this._usersRepository.add(userModel);
  }

  async feed(id: string): AsyncReturn<Error, Array<UsersModel>> {
    const [[userErr, userData], [userListErr, userListData]] =
      await Promise.all([
        this._usersRepository.getById(id),
        this._usersRepository.getAll(),
      ]);
    const error = userErr || userListErr;
    if (error) {
      return [error];
    }

    const userList = userListData.filter((v) => v.id !== userData.id);
    const result = this._closestLocation(userData.location, userList);

    return [null, result];
  }

  async like(id: string, likedUserId: string): AsyncReturn<Error, undefined> {
    const [byError, byUserData] = await this._usersRepository.getById(id);
    if (byError) {
      return [byError];
    }

    const [error] = await this._usersRepository.addLike(id, likedUserId);
    if (error) {
      return [error];
    }

    this._eventService.likePublish(likedUserId, byUserData);

    return [null];
  }

  async dislike(
    id: string,
    dislikedUserId: string,
  ): AsyncReturn<Error, undefined> {
    const [byError, byUserData] = await this._usersRepository.getById(id);
    if (byError) {
      return [byError];
    }

    const [error] = await this._usersRepository.addDislike(id, dislikedUserId);
    if (error) {
      return [error];
    }

    this._eventService.dislikePublish(dislikedUserId, byUserData);

    return [null];
  }

  async login(username: string, password: string): AsyncReturn<Error, string> {
    const filter = new FilterModel<UsersModel>();
    filter.addCondition({
      $opr: 'eq',
      email: username,
    });
    const [error, usersList] = await this._usersRepository.getAll(filter);
    if (error) {
      return [error];
    }
    if (usersList.length === 0) {
      return [new AuthenticateException()];
    }

    const userModel = usersList[0];
    const passwordHash = await bcrypt.hash(password, userModel.salt);
    if (passwordHash !== userModel.password) {
      return [new AuthenticateException()];
    }

    return [null, userModel.id];
  }

  async getById(id: string): AsyncReturn<Error, UsersModel> {
    return this._usersRepository.getById(id);
  }

  private _closestLocation(targetLocation: LocationModel, locationData: Array<UsersModel>): Array<UsersModel> {
    return locationData.filter((v) =>
      getDistance(
        { lat: targetLocation.lat, lng: targetLocation.long },
        { lat: v.location.lat, lng: v.location.long },
      ) <= 100000,
    );
  }
}
