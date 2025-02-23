import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { UserEntity, users } from './entities/user.entity';
import { eq } from 'drizzle-orm';

@Injectable()
export class UserService {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const userList = await this.drizzle
      .insert(users)
      .values(createUserDto)
      .returning()
      .execute();
    return userList[0];
  }

  async findAll(): Promise<UserEntity[]> {
    return this.drizzle.query.users.findMany();
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.drizzle.query.users.findFirst({
      where: eq(users.id, id),
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    await this.findOne(id);
    const userList = await this.drizzle
      .update(users)
      .set(updateUserDto)
      .where(eq(users.id, id))
      .returning()
      .execute();
    return userList[0];
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.drizzle.delete(users).where(eq(users.id, id)).execute();
  }
}
