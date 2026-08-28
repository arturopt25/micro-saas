import { z } from 'zod';

export const roleSchema = z.enum(['OWNER', 'TENANT']);
export type Role = z.infer<typeof roleSchema>;

export const localeSchema = z.enum(['en', 'es']);
export type Locale = z.infer<typeof localeSchema>;

export const themeSchema = z.enum(['light', 'dark']);
export type Theme = z.infer<typeof themeSchema>;

export const sessionUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  image: z.string().nullable(),
  role: roleSchema,
  workspaceId: z.string(),
  workspaceName: z.string(),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

export const userPreferencesSchema = z.object({
  locale: localeSchema,
  theme: themeSchema,
});
export type UserPreferences = z.infer<typeof userPreferencesSchema>;

export const agentRequestSchema = z.object({
  message: z.string().min(1),
});
export type AgentRequest = z.infer<typeof agentRequestSchema>;
