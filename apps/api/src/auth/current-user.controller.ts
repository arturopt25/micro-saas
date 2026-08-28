import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';

@Controller('users/me')
export class CurrentUserController {
  @Get()
  getCurrentUser(@Req() request: Request) {
    return request.user;
  }
}
