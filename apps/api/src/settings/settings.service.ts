import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/db';
import type { Locale, Theme, UserPreferences } from '@repo/shared-types';

@Injectable()
export class SettingsService {
  async getPreferences(userId: string): Promise<UserPreferences> {
    const preferences = await prisma.userPreference.findUnique({ where: { userId } });
    if (!preferences) throw new NotFoundException('PREFERENCES_NOT_FOUND');
    return { locale: preferences.locale as Locale, theme: preferences.theme as Theme };
  }

  async updatePreferences(userId: string, preferences: UserPreferences): Promise<UserPreferences> {
    const saved = await prisma.userPreference.upsert({
      where: { userId },
      create: { userId, locale: preferences.locale, theme: preferences.theme },
      update: { locale: preferences.locale, theme: preferences.theme },
    });
    return { locale: saved.locale as Locale, theme: saved.theme as Theme };
  }
}
