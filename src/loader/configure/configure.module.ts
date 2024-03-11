import { resolve } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidate } from './validation/env.validation';
import serverConfig from './config/server.config';
import mysqlConfig from './config/mysql.config';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      envFilePath: resolve('env', 'app', '.env'),
      validate: envValidate,
      load: [serverConfig, mysqlConfig, jwtConfig],
    }),
  ],
})
export class ConfigureModule {}
