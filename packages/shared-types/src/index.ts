import { z } from 'zod';

export const roleSchema = z.enum(['ADMIN', 'MEMBER']);
export type Role = z.infer<typeof roleSchema>;

export const agentRequestSchema = z.object({
  message: z.string().min(1),
});
export type AgentRequest = z.infer<typeof agentRequestSchema>;
