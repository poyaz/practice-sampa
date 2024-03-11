import {UpdateInstanceType} from './type';

export class UpdateModel<T> {
  id: string;
  private readonly _props;

  constructor(id: string, props: UpdateInstanceType<T>) {
    this.id = id;
    delete props['id'];
    delete props['insertDate'];
    this._props = props;
  }

  getModel(): UpdateInstanceType<T> {
    return this._props;
  }
}