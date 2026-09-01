import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from './auth.middleware';
import { CurrentUserController } from './current-user.controller';
import { prisma } from '@repo/db';

@Module({
  controllers: [AuthController, CurrentUserController],
  providers: [{ provide: 'PRISMA', useValue: prisma }],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AuthMiddleware).forRoutes('users', 'owner', 'tenant');
  }
}
