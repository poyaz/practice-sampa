import {SortEnum} from '@common/filter.model';

export type Return<E, D> = typeof E extends null | undefined
  ? [E]
  : D extends null | undefined
    ? [null | undefined, null | undefined]
    : D extends Array<any>
      ? [null | undefined, D, number]
      : [null | undefined, D];
export type AsyncReturn<E, D> = Promise<Return<E, D>>;

export type UpdateInstanceType<T> = Partial<Omit<Pick<T, { [K in keyof T]: T[K] extends Function ? never : K }[keyof T]>, 'id' | 'insertDate'>>;

export type PickOne<T> = { [P in keyof T]: Record<P, T[P]> & Partial<Record<Exclude<keyof T, P>, undefined>> }[keyof T];

export type KnownKeys<T> = {
  [K in keyof T]: string extends K ? never : number extends K ? never : K
} extends { [_ in keyof T]: infer U } ? U : never;

export type FilterOperationType = 'eq' | 'neq' | 'gte' | 'gt' | 'lte' | 'lt';

export type FilterInstanceType<T> =
  PickOne<Partial<Omit<Pick<T, { [K in keyof T]: T[K] extends Function ? never : K }[keyof T]>, 'id' | 'deleteDate'>>>;

export type PartialSort<T> = {
  [P in keyof T]?: SortEnum;
};