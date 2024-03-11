import { resolve } from 'path';
import { registerAs } from '@nestjs/config';
import { ServerConfigInterface } from '../interface/server-config.interface';
import { convertStringToBoolean } from '../utility';

export default registerAs('server', (): ServerConfigInterface => {
  return {
    host: process.env.SERVER_HOST || '0.0.0.0',
    http: {
      port: Number(process.env.SERVER_HTTP_PORT || 3000),
    },
    https: {
      port: Number(process.env.SERVER_HTTPS_PORT || 3443),
      force: convertStringToBoolean(process.env.SERVER_HTTPS_FORCE),
    },
    uploadPath: process.env.SERVER_UPLOAD_PATH || resolve('storage', 'upload'),
  };
});
