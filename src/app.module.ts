import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigureModule } from './loader/configure/configure.module';
import { MysqlModule } from './loader/mysql/mysql.module';
import { PrismaService } from './loader/mysql/mysql.service';
import { UsersModule } from './module/users/users.moduel';
import { UuidIdentifier } from '@infra/uuid-identifier';
import {
  USERS_MODULE_DATABASE_INJECT_TOKEN, USERS_MODULE_DATETIME_INJECT_TOKEN,
  USERS_MODULE_IDENTIFIER_INJECT_TOKEN, USERS_MODULE_LOGGER_INJECT_TOKEN,
} from './module/users/users.constant';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DateTime } from '@infra/date-time';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '@infra/jwt-strategy';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '@guard/jwt-auth.guard';
import { MulterModule } from '@nestjs/platform-express';
import { ServerConfigInterface } from './loader/configure/interface/server-config.interface';

@Module({
  imports: [
    ConfigureModule,
    MysqlModule,
    LoggerModule.forRoot({
      pinoHttp: {
        autoLogging: false,
        genReqId: () => null,
        quietReqLogger: true,
        transport: { target: 'pino-pretty' },
      },
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET_KEY'),
      }),
    }),
    UsersModule.forRootAsync({
      imports: [
        AppModule,
        MulterModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            dest: configService.get<ServerConfigInterface>('server').uploadPath,
            preservePath: true,
          }),
        }),
      ],
      providers: [
        {
          provide: USERS_MODULE_DATETIME_INJECT_TOKEN,
          useExisting: 'DATE_TIME',
        },
        {
          provide: USERS_MODULE_LOGGER_INJECT_TOKEN,
          useExisting: Logger,
        },
        {
          provide: USERS_MODULE_DATABASE_INJECT_TOKEN,
          useExisting: PrismaService,
        },
        {
          provide: USERS_MODULE_IDENTIFIER_INJECT_TOKEN,
          useClass: UuidIdentifier,
        },
      ],
    }),
  ],
  controllers: [],
  providers: [
    Logger,
    ConfigService,
    {
      provide: JwtStrategy,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => new JwtStrategy(configService.get('JWT_SECRET_KEY')),
    },
    {
      provide: 'DATE_TIME',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const TZ = configService.get<string>('TZ');
        if (TZ !== '') {
          return new DateTime('en', TZ);
        }

        return new DateTime();
      },
    },
    {
      provide: APP_GUARD,
      inject: [ConfigService, Reflector],
      useFactory: (configService: ConfigService, reflector: Reflector) => {
        return new JwtAuthGuard(reflector);
      },
    },
  ],
  exports: ['DATE_TIME', Logger],
})
export class AppModule {}
