import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsEmail, IsLatitude, IsLongitude,
  IsNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { instanceToPlain, plainToInstance, Transform, Type } from 'class-transformer';
import { MatchConfirm } from '@decorator/match-confirm.decorator';
import { UsersModel } from '@users-domain/users.model';

export class RegisterLocationInputDto {
  @ApiProperty({
    description: 'The latitude of user',
    type: Number,
    required: true,
    example: -34.397,
  })
  @IsNumber()
  @IsDefined()
  @Transform((param) => Number(param.value))
  lat: number;

  @ApiProperty({
    description: 'The latitude of user',
    type: Number,
    required: true,
    example: 150.644,
  })
  @IsNumber()
  @IsDefined()
  @Transform((param) => Number(param.value))
  long: number;
}

export class RegisterInputDto {
  @ApiProperty({
    description: 'The name of user',
    type: String,
    minLength: 4,
    maxLength: 50,
    pattern: '^[a-zA-Z ]+$',
    required: true,
    example: 'first last',
  })
  @IsString()
  @Matches(/^[a-zA-Z ]+$/)
  @MinLength(4)
  @MaxLength(50)
  @IsDefined()
  name: string;

  @ApiProperty({
    description: 'The email of user for login',
    type: String,
    minLength: 3,
    maxLength: 100,
    format: 'email',
    required: true,
    example: 'my-email@example.com',
  })
  @IsEmail()
  @MinLength(3)
  @MaxLength(50)
  @IsDefined()
  email: string;

  @ApiProperty({
    description: 'The password of user for login',
    type: String,
    minLength: 6,
    maxLength: 50,
    required: true,
    example: 'my password',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @IsDefined()
  password: string;

  @ApiProperty({
    description: 'The confirmation of password',
    type: String,
    minLength: 6,
    maxLength: 50,
    required: true,
    example: 'my password',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @IsDefined()
  @MatchConfirm('password', {
    message: 'The confirmPassword not match with password',
  })
  confirmPassword: string;

  @ApiProperty({
    description: 'The biography of user',
    type: String,
    minLength: 2,
    maxLength: 200,
    required: true,
    example: 'biography',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  @IsDefined()
  bio: string;

  @ApiProperty({
    description: 'The location of user',
    type: RegisterLocationInputDto,
    required: true,
    example: {
      lat: -34.397,
      long: 150.644,
    },
  })
  @Type(() => RegisterLocationInputDto)
  @ValidateNested()
  @IsDefined()
  location: RegisterLocationInputDto;

  static toModel(dto: RegisterInputDto, files: Array<Express.Multer.File>): UsersModel {
    const data = instanceToPlain(dto, {excludePrefixes: ['confirmPassword']});
    const model = plainToInstance(UsersModel, data);
    model.avatars = files.map((v) => ({name: v.originalname, path: v.path}));

    return model;
  }
}
