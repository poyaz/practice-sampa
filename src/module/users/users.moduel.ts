import { DynamicModule, Module } from '@nestjs/common';
import { UsersModuleAsyncOptions } from './users.interface';
import { createUsersController, createUsersProvider } from './users.provider';

@Module({
  imports: [],
  controllers: [],
  providers: [],
  exports: [],
})
export class UsersModule {
  static forRootAsync(options: UsersModuleAsyncOptions): DynamicModule {
    return {
      module: UsersModule,
      imports: options.imports || [],
      controllers: <Array<any>>createUsersController(),
      providers: [...createUsersProvider(), ...(options.providers || [])],
      exports: [UsersModule],
    };
  }
}
