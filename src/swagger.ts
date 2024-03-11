import { DocumentBuilder } from '@nestjs/swagger';
import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { OpenAPIObject } from '@nestjs/swagger/dist/interfaces';

export function generateSwagger(): Omit<OpenAPIObject, 'paths'> {
  return new DocumentBuilder()
    .setTitle('Sampa api')
    .setDescription('The practice for sampa')
    .setVersion('1.0')
    .addTag('users', 'This section for using by user')
    .addBearerAuth(<SecuritySchemeObject>{
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'JWT token header',
      in: 'header',
    })
    .build();
}
