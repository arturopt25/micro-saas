import { render, screen, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DashboardPage } from './DashboardPage';
import '../i18n/config';

vi.mock('../../lib/api-client', () => ({
  apiRequest: vi.fn().mockImplementation((path: string) => {
    if (path.includes('/owner/properties')) {
      return Promise.resolve({ buildings: [], residences: [] });
    }
    if (path.includes('/catalog/properties')) {
      return Promise.resolve({ buildings: [], residences: [], hasMore: false });
    }
    if (path.includes('/catalog/units')) {
      return Promise.resolve({ apartments: [], houses: [], hasMore: false });
    }
    if (path.includes('/users/me/property')) {
      return Promise.resolve(null);
    }
    if (path.includes('/tenant/applications')) {
      return Promise.resolve([]);
    }
    return Promise.resolve([]);
  }),
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders owner-specific dashboard content', async () => {
    render(
      <MantineProvider>
        <DashboardPage role="OWNER" />
      </MantineProvider>,
    );
    expect(screen.getByText('Workspace overview')).toBeInTheDocument();
    expect(screen.getByText('Owner')).toBeInTheDocument();
    await waitFor(() => {});
  });

  it('renders tenant-specific dashboard content', async () => {
    render(
      <MantineProvider>
        <DashboardPage role="TENANT" />
      </MantineProvider>,
    );
    expect(screen.getByText('Your personal overview')).toBeInTheDocument();
    expect(screen.getByText('Tenant')).toBeInTheDocument();
    await waitFor(() => {});
  });
});
