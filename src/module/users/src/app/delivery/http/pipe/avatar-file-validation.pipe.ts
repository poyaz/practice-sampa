import { ArgumentMetadata, HttpStatus, Injectable, PipeTransform, UnprocessableEntityException } from '@nestjs/common';

@Injectable()
export class AvatarFileValidationPipe implements PipeTransform<{ avatar?: Array<Express.Multer.File> }> {
  transform(value: { avatar?: Array<Express.Multer.File> }, metadata: ArgumentMetadata) {
    const tenMb = 10000000;

    const avatars = value?.avatar || [];
    if (avatars.length === 0) {
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: [`The avatar file not found`],
        error: 'Unprocessable Entity',
      });
    }

    avatars.map((v) => {
      if (v.size > tenMb) {
        throw new UnprocessableEntityException({
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: [`Identity file too large, you can upload files up to ${tenMb} MB`],
          error: 'Unprocessable Entity',
        });
      }

      if (!/.+\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.exec(v.originalname)) {
        throw new UnprocessableEntityException({
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: ['Identity file must be image format'],
          error: 'Unprocessable Entity',
        });
      }
    })

    return value;
  }
}
