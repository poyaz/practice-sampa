import { IoAdapter } from '@nestjs/platform-socket.io';
import { isFunction } from 'rxjs/internal/util/isFunction';

export class SocketIoAdapter extends IoAdapter {
  public mapPayload(payload: unknown): { data: any; ack? } {
    if (!Array.isArray(payload)) {
      if (isFunction(payload)) {
        return { data: undefined, ack: payload };
      }

      return { data: SocketIoAdapter._convert(payload) };
    }
    const lastElement = payload[payload.length - 1];
    const isAck = isFunction(lastElement);
    if (isAck) {
      const size = payload.length - 1;
      return {
        data: size === 1 ? payload[0] : payload.slice(0, size),
        ack: lastElement,
      };
    }

    return { data: payload.map((v) => SocketIoAdapter._convert(v)) };
  }

  private static _convert(payload) {
    const data = { type: '', body: {} };
    try {
      data.body = JSON.parse(<string>(<any>payload));
      data.type = 'json';
    } catch (error) {
      data.body = payload;
      data.type = 'string';
    }

    return data;
  }
}
