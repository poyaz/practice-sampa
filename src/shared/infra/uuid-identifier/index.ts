import { Injectable } from '@nestjs/common';
import { IIdentifierAdapter } from '@adapter/identifier.adapter';
import * as uuid from 'uuid';

@Injectable()
export class UuidIdentifier implements IIdentifierAdapter {
  generateId(): string {
    return uuid.v4();
  }
}
