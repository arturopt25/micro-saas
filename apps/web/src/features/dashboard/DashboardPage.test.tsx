import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { describe, expect, it } from 'vitest';
import { DashboardPage } from './DashboardPage';
import '../i18n/config';

describe('DashboardPage', () => {
  it('renders owner-specific dashboard content', () => {
    render(
      <MantineProvider>
        <DashboardPage role="OWNER" />
      </MantineProvider>,
    );
    expect(screen.getByText('Workspace overview')).toBeInTheDocument();
    expect(screen.getByText('Owner')).toBeInTheDocument();
  });

  it('renders tenant-specific dashboard content', () => {
    render(
      <MantineProvider>
        <DashboardPage role="TENANT" />
      </MantineProvider>,
    );
    expect(screen.getByText('Your personal overview')).toBeInTheDocument();
    expect(screen.getByText('Tenant')).toBeInTheDocument();
  });
});
