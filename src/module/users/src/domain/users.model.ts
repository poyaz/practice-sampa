export class LocationModel {
  lat: number;
  long: number;

  constructor(props?: Partial<typeof LocationModel.prototype>) {
    Object.assign(this, props);
  }

  clone(): LocationModel {
    return Object.assign(Object.create(this), this);
  }
}

export class UsersModel {
  id: string;
  name: string;
  email: string;
  password: string;
  salt: string;
  avatars: Array<{ id?: string; name: string; path: string }>;
  bio: string;
  location: Omit<LocationModel, 'clone'>;
  like: number;
  dislike: number;

  constructor(props?: Partial<typeof UsersModel.prototype>) {
    Object.assign(this, props);
  }

  clone(): UsersModel {
    return Object.assign(Object.create(this), this);
  }
}
