import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { User, UserService } from './user.service';

@Controller("users")
export class UserControler {
  constructor(private readonly UserService: UserService) {}

  @Get()
  getUsers(): User[] {
    return this.UserService.getUsers();
  }

  @Post()
  postUser(@Body() newUser: User): User {
    return this.UserService.addUser(newUser);
  }

  @Patch(":id")
  patchUser(@Param("id") id: number, @Body() userData: User): User {
    return this.UserService.updateUser(id, userData);
  }

}
