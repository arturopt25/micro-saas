import { z } from 'zod';

export const roleSchema = z.enum(['OWNER', 'TENANT']);
export type Role = z.infer<typeof roleSchema>;
export const accountTypeSchema = roleSchema;
export type AccountType = Role;

export const applicationStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']);
export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;

export const unitStatusSchema = z.enum([
  'AVAILABLE',
  'PENDING',
  'OCCUPIED',
  'MAINTENANCE',
  'INACTIVE',
]);
export type UnitStatus = z.infer<typeof unitStatusSchema>;

export const propertyTypeSchema = z.enum(['BUILDING', 'RESIDENCE']);
export type PropertyType = z.infer<typeof propertyTypeSchema>;

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
  search: z.string().trim().optional(),
});
export type PaginationInput = z.infer<typeof paginationSchema>;

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

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
  workspaceId: z.string().nullable(),
  workspaceName: z.string().nullable(),
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
