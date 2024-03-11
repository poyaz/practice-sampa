import { Prisma, PrismaClient } from '@prisma/client';
import { IUserRepository } from '@users-domain/users.interface';
import { AsyncReturn } from '@common/type';
import { UsersModel } from '@users-domain/users.model';
import { FilterModel } from '@common/filter.model';
import { Avatar } from '@prisma/client';
import { UsersModelOutputDto } from '@users-repository/mysql/dto/users-model-output.dto';

export class UsersRepository implements IUserRepository {
  constructor(private readonly _prismaClient: PrismaClient) {
  }

  async add(model: UsersModel): AsyncReturn<Error, UsersModel> {
    try {
      const data = await this._prismaClient.user.create({
        data: {
          id: model.id,
          name: model.name,
          email: model.email,
          password: model.password,
          salt: model.salt,
          bio: model.bio,
          location: <Prisma.JsonObject>(<any>model.location),
          avatars: {
            createMany: {
              data: model.avatars.map(
                (v) => <Avatar>{ name: v.name, path: v.path },
              ),
            },
          },
        },
        include: { avatars: true, impressions: true },
      });

      return [null, UsersModelOutputDto.toModel(data)];
    } catch (error) {
      return [error];
    }
  }

  async getAll(
    filter?: FilterModel<UsersModel>,
  ): AsyncReturn<Error, Array<UsersModel>> {
    const findOptions: Prisma.UserWhereInput = {};

    if (filter) {
      const filterModel = <FilterModel<UsersModel>>(<any>filter);

      if (filterModel.getLengthOfCondition() > 0) {
        const getEmail = filterModel.getCondition('email');
        if (getEmail) {
          findOptions.email = getEmail.email;
        }
      }
    }

    try {
      const data = await this._prismaClient.user.findMany({
        where: findOptions,
        include: { avatars: true, impressions: true },
      });

      const result = data.map((v) => UsersModelOutputDto.toModel(v));

      return [null, result];
    } catch (error) {
      return [error];
    }
  }

  async getById(id: string): AsyncReturn<Error, UsersModel> {
    try {
      const data = await this._prismaClient.user.findFirstOrThrow({
        where: { id },
        include: { avatars: true, impressions: true },
      });

      return [null, UsersModelOutputDto.toModel(data)];
    } catch (error) {
      return [error];
    }
  }

  async addLike(
    userId: string,
    byUserId: string,
  ): AsyncReturn<Error, undefined> {
    try {
      await this._prismaClient.impression.create({
        data: {
          userId: userId,
          byUserId: byUserId,
          isLike: true,
        },
      });

      return [null];
    } catch (error) {
      return [error];
    }
  }

  async addDislike(
    userId: string,
    byUserId: string,
  ): AsyncReturn<Error, undefined> {
    try {
      await this._prismaClient.impression.create({
        data: {
          userId: userId,
          byUserId: byUserId,
          isLike: false,
        },
      });

      return [null];
    } catch (error) {
      return [error];
    }
  }
}
