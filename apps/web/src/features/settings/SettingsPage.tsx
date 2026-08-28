import { useState } from 'react';
import { Button, Card, Group, PasswordInput, Select, Stack, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../../lib/api-client';
import type { SupportedLocale } from '../i18n/config';
import type { Theme } from '@repo/shared-types';

export function SettingsPage({
  onThemeChange,
}: {
  onThemeChange: (theme: Theme) => void;
}): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const [locale, setLocale] = useState<SupportedLocale>(
    i18n.language.startsWith('es') ? 'es' : 'en',
  );
  const [theme, setTheme] = useState(
    localStorage.getItem('micro-saas-theme') === 'light' ? 'light' : 'dark',
  );
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  async function savePreferences(): Promise<void> {
    localStorage.setItem('micro-saas-locale', locale);
    localStorage.setItem('micro-saas-theme', theme);
    onThemeChange(theme as Theme);
    await i18n.changeLanguage(locale);
    try {
      await apiRequest('/users/me/preferences', {
        method: 'PATCH',
        body: JSON.stringify({ locale, theme }),
      });
    } catch {
      /* API may be offline during local UI work. */
    }
    notifications.show({ message: t('settings.preferencesSaved') });
  }

  async function changePassword(): Promise<void> {
    await apiRequest('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword: password }),
    });
    setCurrentPassword('');
    setPassword('');
  }

  return (
    <Stack>
      <Title order={1}>{t('settings.title')}</Title>
      <Card withBorder>
        <Stack>
          <Select
            label={t('settings.language')}
            value={locale}
            onChange={(value) => setLocale((value as SupportedLocale) ?? 'en')}
            data={[
              { value: 'en', label: 'English' },
              { value: 'es', label: 'Español' },
            ]}
          />
          <Select
            label={t('settings.theme')}
            value={theme}
            onChange={(value) => setTheme(value === 'light' ? 'light' : 'dark')}
            data={[
              { value: 'dark', label: t('settings.dark') },
              { value: 'light', label: t('settings.light') },
            ]}
          />
          <Group justify="flex-end">
            <Button onClick={() => void savePreferences()}>{t('common.save')}</Button>
          </Group>
        </Stack>
      </Card>
      <Card withBorder>
        <Stack>
          <Title order={3}>{t('settings.security')}</Title>
          <PasswordInput
            label={t('auth.password')}
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.currentTarget.value)}
          />
          <PasswordInput
            label={t('settings.newPassword')}
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
          />
          <Button
            variant="light"
            disabled={password.length < 8 || currentPassword.length === 0}
            onClick={() => void changePassword()}
          >
            {t('settings.changePassword')}
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}
