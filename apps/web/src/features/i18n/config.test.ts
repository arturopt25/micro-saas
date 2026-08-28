import { describe, expect, it } from 'vitest';
import i18n from './config';

describe('i18n', () => {
  it('supports English and Spanish translations', async () => {
    await i18n.changeLanguage('es');
    expect(i18n.t('dashboard.title')).toBe('Panel');
    await i18n.changeLanguage('en');
    expect(i18n.t('dashboard.title')).toBe('Dashboard');
  });
});
