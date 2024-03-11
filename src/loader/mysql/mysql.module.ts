import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './mysql.service';

@Global()
@Module({
  imports: [],
  providers: [ConfigService, PrismaService],
  exports: [PrismaService],
})
export class MysqlModule {}
