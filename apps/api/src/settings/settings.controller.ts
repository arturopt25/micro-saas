import { Body, Controller, Get, Inject, Patch, Req } from '@nestjs/common';
import type { Request } from 'express';
import { z } from 'zod';
import { SettingsService } from './settings.service';

const preferencesSchema = z.object({
  locale: z.enum(['en', 'es']),
  theme: z.enum(['light', 'dark']),
});
type AuthenticatedRequest = Request & { user: { id: string; role: string; workspaceId: string } };

@Controller('users/me/preferences')
export class SettingsController {
  constructor(@Inject(SettingsService) private readonly settingsService: SettingsService) {}

  @Get()
  getPreferences(@Req() request: AuthenticatedRequest) {
    return this.settingsService.getPreferences(request.user.id);
  }

  @Patch()
  updatePreferences(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    return this.settingsService.updatePreferences(request.user.id, preferencesSchema.parse(body));
  }
}
