import { registerAs } from '@nestjs/config';
import { JwtConfigInterface } from '../interface/jwt-config.interface';

export default registerAs('jwt', (): JwtConfigInterface => {
  return {
    secret: process.env.JWT_SECRET_KEY,
  };
});
