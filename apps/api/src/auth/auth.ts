import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@repo/db';

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await prisma.workspace.create({
            data: {
              name: `${user.name}'s workspace`,
              slug: `${user.id}-workspace`,
              memberships: { create: { userId: user.id, role: 'OWNER' } },
            },
          });
          await prisma.userPreference.create({ data: { userId: user.id } });
        },
      },
    },
  },
  trustedOrigins: [process.env.WEB_URL ?? 'http://localhost:5173'],
});
