import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AuthPage } from './AuthPage';
import '../i18n/config';

describe('AuthPage', () => {
  it('rejects passwords shorter than Better Auth minimum', async () => {
    render(
      <MantineProvider>
        <AuthPage mode="register" onAuthenticated={vi.fn()} />
      </MantineProvider>,
    );
    const password = document.querySelector('input[type="password"]');
    expect(password).not.toBeNull();
    const user = userEvent.setup();
    await user.type(password as HTMLInputElement, 'short');
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
  });
});
