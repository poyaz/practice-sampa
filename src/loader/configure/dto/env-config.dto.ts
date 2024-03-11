import {
  IsDataURI,
  IsDefined,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString, IsUrl, Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { EnvironmentEnum } from '../enum/environment.enum';
import { BooleanEnum } from '../enum/boolean.enum';

export class EnvConfigDto {
  @IsOptional()
  @IsString()
  TZ?: string;

  @IsOptional()
  @IsEnum(EnvironmentEnum)
  @Transform((param) => param.value.toLowerCase())
  NODE_ENV?: EnvironmentEnum;

  @IsOptional()
  @IsString()
  SERVER_HOST?: string;

  @IsOptional()
  @IsNumber()
  SERVER_HTTP_PORT?: number;

  @IsOptional()
  @IsNumber()
  SERVER_HTTPS_PORT?: number;

  @IsOptional()
  @IsEnum(BooleanEnum)
  @Transform((param) => param.value.toLowerCase())
  SERVER_HTTPS_FORCE?: BooleanEnum;

  @IsOptional()
  @IsString()
  SERVER_UPLOAD_PATH?: string;

  @IsDefined()
  @Matches(
    /^(mysqlx?:\/\/)(?:([\w$_]*)(?::([\w$_]+))?@)?([\w!#$%&'()*+,\-./;=?@[\]_~]*)(?::(\d{1,5}))?(?:\/.+)?$/,
  )
  DB_MYSQL_URL: string;

  @IsDefined()
  @IsString()
  JWT_SECRET_KEY: string;
}
