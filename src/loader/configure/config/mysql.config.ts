import { registerAs } from '@nestjs/config';
import { DatabaseConfigInterface } from '../interface/database-config.interface';

export default registerAs('mysql', (): DatabaseConfigInterface => {
  return {
    host: process.env.DB_MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.DB_MYSQL_PORT || 5432),
    db: process.env.DB_MYSQL_DATABASE || 'sampa',
    username: process.env.DB_MYSQL_USERNAME,
    password: process.env.DB_MYSQL_PASSWORD,
  };
});
