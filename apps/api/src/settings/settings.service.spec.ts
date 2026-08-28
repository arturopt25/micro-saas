import { describe, expect, it, vi } from 'vitest';
import { SettingsService } from './settings.service';

vi.mock('@repo/db', () => ({
  prisma: {
    userPreference: {
      findUnique: vi.fn().mockResolvedValue({ locale: 'en', theme: 'dark' }),
      upsert: vi.fn().mockResolvedValue({ locale: 'es', theme: 'light' }),
    },
  },
}));

describe('SettingsService', () => {
  it('returns persisted user preferences', async () => {
    const service = new SettingsService();
    await expect(service.getPreferences('user-1')).resolves.toEqual({
      locale: 'en',
      theme: 'dark',
    });
  });

  it('updates user preferences', async () => {
    const service = new SettingsService();
    await expect(
      service.updatePreferences('user-1', { locale: 'es', theme: 'light' }),
    ).resolves.toEqual({ locale: 'es', theme: 'light' });
  });
});
