import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { prisma } from '@repo/db';
import { auth } from './auth';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(request: Request, response: Response, next: NextFunction): Promise<void> {
    const session = await auth.api.getSession({
      headers: new Headers(request.headers as Record<string, string>),
    });
    if (!session) {
      response.status(401).json({ code: 'UNAUTHORIZED' });
      return;
    }
    const membership = await prisma.workspaceMembership.findFirst({
      where: { userId: session.user.id },
      include: { workspace: true },
    });
    if (!membership) {
      response.status(403).json({ code: 'WORKSPACE_MEMBERSHIP_REQUIRED' });
      return;
    }
    request.user = {
      id: session.user.id,
      role: membership.role,
      workspaceId: membership.workspaceId,
    };
    next();
  }
}
