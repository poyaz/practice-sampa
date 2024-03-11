import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(
    private readonly _reflector: Reflector,
    private readonly _jwtService: JwtService,
  ) {
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const disableCheckAuth = this._reflector.get<string[]>(
      'disableCheckAuth',
      context.getHandler(),
    );
    if (disableCheckAuth) {
      return true;
    }

    const ws = context.switchToWs();
    const authorization = ws.getClient().handshake.headers.authorization;
    if (!authorization) {
      return false;
    }
    const [, token] = authorization.split(' ');
    if (!token) {
      return false;
    }

    try {
      const user = this._jwtService.verify(token);
      ws.getData().user = { userId: user.userId };

      return true;
    } catch (error) {
      console.log(error)
      throw new WsException(error.message);
    }
  }
}
