import { Body, Controller, Get, Param, Patch, Post, Delete, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';

@Controller('users')
export class UserControler {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(+id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  @Post()
  postUser(@Body() user: User) {
    return this.userService.create(user);
  }

  @Patch(':id')
  patchUser(@Param('id') id: string, @Body() user: User) {
    return this.userService.update(+id, user);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.userService.delete(+id);
  }

}
