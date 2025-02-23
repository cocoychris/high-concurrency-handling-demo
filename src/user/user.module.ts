import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RoleModule } from './role/role.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [RoleModule],
})
export class UserModule {}
