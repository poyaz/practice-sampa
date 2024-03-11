import { UsersModel } from '@users-domain/users.model';

export class UsersModelOutputDto {
  static toModel(data: any): UsersModel {
    return new UsersModel({
      id: data.id,
      name: data.name,
      email: data.email,
      password: data.password,
      salt: data.salt,
      avatars: data.avatars.map((v) => ({
        id: v.id,
        name: v.name,
        path: v.path,
      })),
      bio: data.bio,
      location: data.location,
      like: data.impressions.filter((v) => v.isLike).length,
      dislike: data.impressions.filter((v) => !v.isLike).length,
    });
  }
}
