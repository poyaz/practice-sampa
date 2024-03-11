import {
  Body,
  Controller,
  Get,
  Request,
  Inject,
  Param,
  Post,
  UseInterceptors,
  NestInterceptor,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { RegisterInputDto } from './dto/register-input.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { IUserService } from '@users-domain/users.interface';
import { HTTP_USER_SERVICE_INJECT_TOKEN } from '@users-delivery/http/users.constant';
import {
  RemovePasswordFieldOfUserInterceptor,
} from '@users-delivery/http/interceptor/remove-password-field-of-user.interceptor';
import { OutputTransferInterceptor } from '@users-delivery/http/interceptor/output.transfer.interceptor';
import { LoginInputDto } from '@users-delivery/http/dto/login-input.dto';
import { ExcludeAuth } from '@decorator/exclude-auth.decorator';
import { JwtService } from '@nestjs/jwt';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { AvatarFileValidationPipe } from '@users-delivery/http/pipe/avatar-file-validation.pipe';
import {
  RemoveAvatarPathFieldOfUserInterceptor,
} from '@users-delivery/http/interceptor/remove-avatar-path-field-of-user.interceptor';
import { OwnAccessGuard } from '@guard/own-access.guard';

@Controller({
  path: 'users',
  version: '1',
})
@UseInterceptors(OutputTransferInterceptor)
@ApiTags('users')
export class UsersController {
  constructor(
    @Inject(HTTP_USER_SERVICE_INJECT_TOKEN)
    private readonly _userService: IUserService,
    private readonly _jwtService: JwtService,
  ) {
  }

  @Post('/register')
  @UseInterceptors(
    <NestInterceptor>(
      (<any>FileFieldsInterceptor([{ name: 'avatar', maxCount: 6 }]))
    ),
  )
  @UseInterceptors(RemovePasswordFieldOfUserInterceptor)
  @UseInterceptors(RemoveAvatarPathFieldOfUserInterceptor)
  @ExcludeAuth()
  @ApiOperation({ description: 'Create new user', operationId: 'Create user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: RegisterInputDto })
  async register(
    @Body() registerInputDto: RegisterInputDto,
    @UploadedFiles(AvatarFileValidationPipe)
      files: { avatar?: Array<Express.Multer.File> },
  ) {
    return this._userService.add(
      RegisterInputDto.toModel(registerInputDto, files.avatar),
    );
  }

  @Post('/login')
  @ExcludeAuth()
  @ApiOperation({ description: 'Login exist user', operationId: 'Login user' })
  @ApiBody({ type: LoginInputDto })
  async login(@Body() loginInputDto: LoginInputDto) {
    const [error, userId] = await this._userService.login(
      loginInputDto.email,
      loginInputDto.password,
    );
    if (error) {
      return [error];
    }

    const payload = {};
    payload['userId'] = userId;
    const token = this._jwtService.sign(payload);

    return [null, token];
  }

  @Get('me')
  @UseGuards(OwnAccessGuard)
  @UseInterceptors(RemovePasswordFieldOfUserInterceptor)
  @UseInterceptors(RemoveAvatarPathFieldOfUserInterceptor)
  @ApiOperation({
    description: 'Get info of current user',
    operationId: 'Get current user',
  })
  @ApiBearerAuth()
  async findMe(@Request() req) {
    return this._userService.getById(req?.user?.userId);
  }

  @Get(':userId/feed')
  @UseGuards(OwnAccessGuard)
  @UseInterceptors(RemovePasswordFieldOfUserInterceptor)
  @UseInterceptors(RemoveAvatarPathFieldOfUserInterceptor)
  @ApiOperation({ description: 'Find nearby users', operationId: 'Feed user' })
  @ApiParam({
    name: 'userId',
    type: String,
    example: '00000000-0000-0000-0000-000000000000',
  })
  @ApiBearerAuth()
  async feed(@Param('userId') userId: string) {
    return this._userService.feed(userId);
  }

  @Post(':userId/like/:likedUserId')
  @UseGuards(OwnAccessGuard)
  @ApiOperation({ description: 'Like user', operationId: 'Like user' })
  @ApiParam({
    name: 'userId',
    type: String,
    example: '00000000-0000-0000-0000-000000000000',
  })
  @ApiParam({
    name: 'likedUserId',
    type: String,
    example: '00000000-0000-0000-0000-000000000000',
  })
  @ApiBearerAuth()
  async like(
    @Param('userId') userId: string,
    @Param('likedUserId') likedUserId: string,
  ) {
    return this._userService.like(userId, likedUserId);
  }

  @Post(':userId/dislike/:dislikedUserId')
  @UseGuards(OwnAccessGuard)
  @ApiOperation({ description: 'Dislike user', operationId: 'Dislike user' })
  @ApiParam({
    name: 'userId',
    type: String,
    example: '00000000-0000-0000-0000-000000000000',
  })
  @ApiParam({
    name: 'dislikedUserId',
    type: String,
    example: '00000000-0000-0000-0000-000000000000',
  })
  @ApiBearerAuth()
  async dislike(
    @Param('userId') userId: string,
    @Param('dislikedUserId') dislikedUserId: string,
  ) {
    return this._userService.dislike(userId, dislikedUserId);
  }
}
