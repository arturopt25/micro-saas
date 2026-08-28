import { Card, Group, SimpleGrid, Stack, Text, Title, Badge } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { Role } from '@repo/shared-types';

export function DashboardPage({ role }: { role: Role }): React.JSX.Element {
  const { t } = useTranslation();
  const isOwner = role === 'OWNER';
  return (
    <Stack>
      <Group justify="space-between">
        <div>
          <Title order={1}>{t('dashboard.title')}</Title>
          <Text c="dimmed">
            {t(isOwner ? 'dashboard.ownerWelcome' : 'dashboard.tenantWelcome')}
          </Text>
        </div>
        <Badge size="lg">{t(isOwner ? 'dashboard.ownerRole' : 'dashboard.tenantRole')}</Badge>
      </Group>
      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <Card withBorder>
          <Text c="dimmed">{t(isOwner ? 'dashboard.members' : 'dashboard.tasks')}</Text>
          <Title order={2}>{isOwner ? 24 : 8}</Title>
        </Card>
        <Card withBorder>
          <Text c="dimmed">{t('dashboard.tasks')}</Text>
          <Title order={2}>{isOwner ? 12 : 5}</Title>
        </Card>
        <Card withBorder>
          <Text c="dimmed">{t('dashboard.reports')}</Text>
          <Title order={2}>{isOwner ? 18 : 3}</Title>
        </Card>
      </SimpleGrid>
      <Card withBorder>
        <Title order={3}>{t('dashboard.activity')}</Title>
        <Text c="dimmed" mt="md">
          {t('common.loading')}
        </Text>
      </Card>
    </Stack>
  );
}
