import { useState } from 'react';
import { Button, Card, PasswordInput, Stack, TextInput, Title, Anchor, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../../lib/api-client';

interface AuthPageProps {
  mode: 'login' | 'register';
  onAuthenticated: () => void;
}

export function AuthPage({ mode, onAuthenticated }: AuthPageProps): React.JSX.Element {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isRegister = mode === 'register';

  async function submit(): Promise<void> {
    if (password.length < 8) {
      setError(t('auth.passwordTooShort'));
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await apiRequest(`/api/auth/${isRegister ? 'sign-up/email' : 'sign-in/email'}`, {
        method: 'POST',
        body: JSON.stringify(isRegister ? { name, email, password } : { email, password }),
      });
      onAuthenticated();
    } catch {
      setError(t('auth.invalid'));
      notifications.show({ color: 'red', message: t('auth.invalid') });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card maw={440} mx="auto" mt="15vh" padding="xl" shadow="md" withBorder>
      <Stack>
        <Title order={2}>{t(isRegister ? 'auth.register' : 'auth.login')}</Title>
        {isRegister && (
          <TextInput
            label={t('auth.name')}
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            required
          />
        )}
        <TextInput
          label={t('auth.email')}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
          required
        />
        <PasswordInput
          label={t('auth.password')}
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
          error={error}
          required
        />
        <Button loading={isSubmitting} onClick={() => void submit()}>
          {t(isRegister ? 'auth.register' : 'auth.login')}
        </Button>
        <Text size="sm">
          {t(isRegister ? 'auth.hasAccount' : 'auth.noAccount')}{' '}
          <Anchor href={isRegister ? '/login' : '/register'}>
            {t(isRegister ? 'auth.login' : 'auth.register')}
          </Anchor>
        </Text>
      </Stack>
    </Card>
  );
}
