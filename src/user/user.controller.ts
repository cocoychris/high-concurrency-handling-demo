import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: '建立使用者' })
  @ApiOkResponse({
    description: '傳回已建立的使用者',
    type: UserDto,
  })
  @HttpCode(HttpStatus.OK)
  create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: '取得所有使用者列表' })
  @ApiOkResponse({
    description: '傳回所有使用者列表',
    type: UserDto,
    isArray: true,
  })
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<UserDto[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '以 ID 取得使用者' })
  @ApiOkResponse({
    description: '傳回找到的使用者',
    type: UserDto,
  })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新使用者' })
  @ApiOkResponse({
    description: '傳回已更新的使用者',
    type: UserDto,
  })
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '刪除使用者' })
  @ApiNoContentResponse({
    description: '成功刪除使用者',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.userService.remove(id);
  }
}
