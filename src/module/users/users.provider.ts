import { Provider } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  USERS_MODULE_DATABASE_INJECT_TOKEN, USERS_MODULE_DATETIME_INJECT_TOKEN,
  USERS_MODULE_IDENTIFIER_INJECT_TOKEN, USERS_MODULE_LOGGER_INJECT_TOKEN,
} from './users.constant';
import {
  HTTP_DATETIME_INFRA_INJECT_TOKEN, HTTP_EVENT_SERVICE_INJECT_TOKEN, HTTP_LOGGER_INJECT_TOKEN,
  HTTP_USER_SERVICE_INJECT_TOKEN,
} from '@users-delivery/http/users.constant';
import { UsersService } from '@users-service/users.service';
import { IIdentifierAdapter } from '@users-service/adapter/identifier.adapter';
import { IUserRepository } from '@users-domain/users.interface';
import { UsersRepository } from '@users-repository/mysql/users.repository';
import { UsersController } from '@users-delivery/http/users.controller';
import { Controller } from '@nestjs/common/interfaces';
import { ImpressionGateway } from '@users-delivery/websocket/impression.gateway';
import { EventService } from '@users-service/event.service';

export function createUsersController(): Controller[] {
  return [UsersController];
}

export function createUsersProvider(): Provider[] {
  return [
    ImpressionGateway,
    EventService,
    {
      provide: UsersRepository,
      inject: [USERS_MODULE_DATABASE_INJECT_TOKEN],
      useFactory: (prismaClient: PrismaClient) =>
        new UsersRepository(prismaClient),
    },
    {
      provide: UsersService,
      inject: [
        UsersRepository,
        USERS_MODULE_IDENTIFIER_INJECT_TOKEN,
        HTTP_EVENT_SERVICE_INJECT_TOKEN,
      ],
      useFactory: (
        userRepository: IUserRepository,
        identifier: IIdentifierAdapter,
        eventService: EventService,
      ) => new UsersService(userRepository, identifier, eventService),
    },
    {
      provide: HTTP_EVENT_SERVICE_INJECT_TOKEN,
      useExisting: EventService,
    },
    {
      provide: HTTP_DATETIME_INFRA_INJECT_TOKEN,
      useExisting: USERS_MODULE_DATETIME_INJECT_TOKEN,
    },
    {
      provide: HTTP_LOGGER_INJECT_TOKEN,
      useExisting: USERS_MODULE_LOGGER_INJECT_TOKEN,
    },
    {
      provide: HTTP_USER_SERVICE_INJECT_TOKEN,
      useExisting: UsersService,
    },
  ];
}
