import { ModuleMetadata } from '@nestjs/common';

export interface UsersModuleAsyncOptions
  extends Partial<Pick<ModuleMetadata, 'imports' | 'providers'>> {
  inject?: any[];
}
