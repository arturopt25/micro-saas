import { All, Controller, Req, Res } from '@nestjs/common';
import type { Request as ExpressRequest, Response } from 'express';
import { auth } from './auth';

@Controller('api/auth')
export class AuthController {
  @All('*path')
  async handle(@Req() request: ExpressRequest, @Res() response: Response): Promise<void> {
    const url = `${process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'}${request.originalUrl}`;
    const headers = new Headers();
    Object.entries(request.headers).forEach(([key, value]) => {
      if (typeof value === 'string') headers.set(key, value);
    });
    const init: RequestInit = { method: request.method, headers };
    if (!['GET', 'HEAD'].includes(request.method)) init.body = JSON.stringify(request.body);
    const result = await auth.handler(new Request(url, init));
    response.status(result.status);
    result.headers.forEach((value, key) => response.setHeader(key, value));
    response.send(await result.text());
  }
}
