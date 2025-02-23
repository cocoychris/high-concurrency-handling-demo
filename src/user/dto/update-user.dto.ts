import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

/**
 * 這也屬於【入境 DTO】
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
