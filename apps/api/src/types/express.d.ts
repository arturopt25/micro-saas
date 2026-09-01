import type { Role } from '@repo/shared-types';

declare global {
  namespace Express {
    interface Request {
      user: User;
    }

    interface User {
      id: string;
      role: Role;
      workspaceId: string | null;
    }
  }
}

export {};
