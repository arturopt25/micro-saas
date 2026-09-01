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
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!membership && user?.accountType !== 'TENANT') {
      response.status(403).json({ code: 'WORKSPACE_MEMBERSHIP_REQUIRED' });
      return;
    }
    const role = membership?.role ?? 'TENANT';
    if (request.path.startsWith('/owner') && role !== 'OWNER') {
      response.status(403).json({ code: 'INSUFFICIENT_ROLE' });
      return;
    }
    if (request.path.startsWith('/tenant') && role !== 'TENANT') {
      response.status(403).json({ code: 'INSUFFICIENT_ROLE' });
      return;
    }
    request.user = {
      id: session.user.id,
      role,
      workspaceId: membership?.workspaceId ?? null,
    };
    next();
  }
}
