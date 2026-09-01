import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AppShell,
  Burger,
  Button,
  Group,
  MantineProvider,
  NavLink,
  Stack,
  Text,
} from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { AuthPage } from './features/auth/AuthPage';
import { SettingsPage } from './features/settings/SettingsPage';
import './features/i18n/config';
import { useTranslation } from 'react-i18next';
import type { Role, SessionUser, Theme } from '@repo/shared-types';
import { apiRequest } from './lib/api-client';

function App(): React.JSX.Element {
  const { t } = useTranslation();
  const [opened, { toggle, close }] = useDisclosure(false);
  const [authenticated, setAuthenticated] = useState(
    () => localStorage.getItem('micro-saas-auth') === 'true',
  );
  const [role, setRole] = useState<Role>(
    () => (localStorage.getItem('micro-saas-role') as Role | null) ?? 'OWNER',
  );
  const [theme, setTheme] = useState<Theme>(() =>
    localStorage.getItem('micro-saas-theme') === 'light' ? 'light' : 'dark',
  );
  const path = window.location.pathname;

  useEffect(() => {
    if (!authenticated) return;
    void apiRequest<SessionUser>('/users/me')
      .then((user) => {
        setRole(user.role);
        localStorage.setItem('micro-saas-role', user.role);
      })
      .catch(() => undefined);
  }, [authenticated]);

  function handleAuthenticated(authenticatedRole: Role): void {
    localStorage.setItem('micro-saas-auth', 'true');
    localStorage.setItem('micro-saas-role', authenticatedRole);
    setRole(authenticatedRole);
    setAuthenticated(true);
    window.history.pushState({}, '', '/dashboard');
  }

  if (!authenticated && path !== '/register')
    return (
      <MantineProvider defaultColorScheme="dark">
        <Notifications />
        <AuthPage mode="login" onAuthenticated={handleAuthenticated} />
      </MantineProvider>
    );
  if (!authenticated)
    return (
      <MantineProvider defaultColorScheme="dark">
        <Notifications />
        <AuthPage mode="register" onAuthenticated={handleAuthenticated} />
      </MantineProvider>
    );

  const page =
    path === '/settings' ? (
      <SettingsPage onThemeChange={setTheme} />
    ) : (
      <DashboardPage role={role} />
    );
  return (
    <MantineProvider forceColorScheme={theme}>
      <Notifications />
      <AppShell
        header={{ height: 64 }}
        navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !opened } }}
        padding="lg"
      >
        <AppShell.Header>
          <Group h="100%" px="md">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text fw={700}>{t('common.appName')}</Text>
          </Group>
        </AppShell.Header>
        <AppShell.Navbar p="md">
          <Stack h="100%" justify="space-between">
            <Stack>
              <NavLink
                component="a"
                href="/dashboard"
                label={t('dashboard.title')}
                onClick={close}
                active={path === '/dashboard' || path === '/'}
              />
              <NavLink
                component="a"
                href="/settings"
                label={t('settings.title')}
                onClick={close}
                active={path === '/settings'}
              />
            </Stack>
            <Button
              bg="blue"
              color="white"
              radius="md"
              m="xs"
              onClick={() => {
                localStorage.removeItem('micro-saas-auth');
                setAuthenticated(false);
              }}
            >
              {t('common.logout')}
            </Button>
          </Stack>
        </AppShell.Navbar>
        <AppShell.Main>{page}</AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');
createRoot(root).render(<App />);
