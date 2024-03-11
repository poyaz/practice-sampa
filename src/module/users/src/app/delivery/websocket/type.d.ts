export type MessageType = 'json' | 'string';

export interface ImpressionDto {
  user: { userId: string };
  body: any;
  type: MessageType;
}
