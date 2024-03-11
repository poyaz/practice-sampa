import { Inject, Logger, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import {
  HTTP_EVENT_SERVICE_INJECT_TOKEN,
  HTTP_LOGGER_INJECT_TOKEN,
  HTTP_USER_SERVICE_INJECT_TOKEN,
} from '@users-delivery/http/users.constant';
import { WsJwtAuthGuard } from '@guard/ws-jwt-auth.guard';
import { ImpressionDto } from '@users-delivery/websocket/type';
import { IUserService } from '@users-domain/users.interface';
import { IImpressionService } from '@users-domain/impression-event.interface';
import { UsersModel } from '@users-domain/users.model';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseGuards(WsJwtAuthGuard)
export class ImpressionGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(HTTP_LOGGER_INJECT_TOKEN) private readonly _logger: Logger,
    @Inject(HTTP_USER_SERVICE_INJECT_TOKEN)
    private readonly _userService: IUserService,
    @Inject(HTTP_EVENT_SERVICE_INJECT_TOKEN)
    private readonly _eventService: IImpressionService,
  ) {
  }

  @WebSocketServer()
  server: Server;

  private readonly _clientToUser: object = {};

  afterInit() {
    this._logger.log('Initialized websocket');
  }

  handleConnection(client: any) {
    const {sockets} = this.server.sockets;

    this._logger.log(`Client id: ${client.id} connected`);
    this._logger.debug(`Number of connected clients: ${sockets.size}`);
  }

  handleDisconnect(client: any) {
    this._logger.log(`Client id:${client.id} disconnected`);
    this._eventService.disconnect(this._clientToUser[client.id]);
    delete this._clientToUser[client.id];
  }

  @SubscribeMessage('impression')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: ImpressionDto,
  ) {
    const userId = data.user.userId;
    if (this._clientToUser[client.id]) {
      return;
    }
    this._clientToUser[client.id] = userId;

    this._eventService.likeSubscribe(userId, (by: UsersModel) => {
      client.emit('like', {
        message: `Your profile was liked by ${by.name}`,
        id: by.id,
        name: by.name,
      });
    });

    this._eventService.dislikeSubscribe(userId, (by: UsersModel) => {
      client.emit('dislike', {
        message: `Your profile was disliked by ${by.name}`,
        id: by.id,
        name: by.name,
      });
    });
  }
}
