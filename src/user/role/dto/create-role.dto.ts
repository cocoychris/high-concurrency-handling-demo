import { Expose } from 'class-transformer';
import { RoleEntity } from '../entities/role.entity';
import { IsInt, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto implements RoleEntity {
  @Expose()
  @ApiProperty({
    description: '使用者角色 ID',
    example: 1,
  })
  @IsInt()
  id: number;

  @Expose()
  @ApiProperty({
    description: '使用者角色名稱',
    example: 'admin',
  })
  @IsString()
  name: string;
}
