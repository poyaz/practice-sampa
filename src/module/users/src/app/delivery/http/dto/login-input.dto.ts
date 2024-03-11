import { PickType } from '@nestjs/swagger';
import { RegisterInputDto } from '@users-delivery/http/dto/register-input.dto';

export class LoginInputDto extends PickType(RegisterInputDto, <const>['email', 'password']) {
}
