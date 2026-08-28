import { useEffect, useState } from 'react';
import { Badge, Card, Group, Select, SimpleGrid, Stack, Tabs, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { Role } from '@repo/shared-types';
import { ApplicationCenter, MaintenancePanel, PaymentPanel } from './OperationsPanels';
import { apiRequest } from '../../lib/api-client';

interface OwnerProperties {
  buildings: Array<{ id: string; name: string }>;
  residences: Array<{ id: string; name: string }>;
}
interface TenantProperty {
  propertyName: string;
  code?: string;
}

function TabContent({ label }: { label: string }): React.JSX.Element {
  return (
    <Card withBorder>
      <Text c="dimmed">{label}</Text>
    </Card>
  );
}

export function DashboardPage({ role }: { role: Role }): React.JSX.Element {
  const { t } = useTranslation();
  const [properties, setProperties] = useState<OwnerProperties>({ buildings: [], residences: [] });
  const [property, setProperty] = useState('');
  const [tenantProperty, setTenantProperty] = useState<TenantProperty | null>(null);
  const isOwner = role === 'OWNER';
  const ownerProperties = [
    ...properties.buildings.map((item) => ({ value: item.id, label: item.name })),
    ...properties.residences.map((item) => ({ value: item.id, label: item.name })),
  ];
  useEffect(() => {
    if (!isOwner) {
      void apiRequest<TenantProperty | null>('/users/me/property')
        .then(setTenantProperty)
        .catch(() => undefined);
      return;
    }
    void apiRequest<OwnerProperties>('/owner/properties?limit=50')
      .then((value) => {
        setProperties(value);
        setProperty(value.buildings[0]?.id ?? value.residences[0]?.id ?? '');
      })
      .catch(() => undefined);
  }, [isOwner]);

  return (
    <Stack>
      <Group justify="space-between" align="end">
        <div>
          <Title order={1}>{t('dashboard.title')}</Title>
          <Text c="dimmed">
            {t(isOwner ? 'dashboard.ownerWelcome' : 'dashboard.tenantWelcome')}
          </Text>
        </div>
        <Badge size="lg">{t(isOwner ? 'dashboard.ownerRole' : 'dashboard.tenantRole')}</Badge>
      </Group>
      {isOwner ? (
        <Select
          label={t('dashboard.properties')}
          value={property}
          onChange={(value) => setProperty(value ?? '')}
          data={ownerProperties}
        />
      ) : (
        <Card withBorder>
          <Text fw={600}>{tenantProperty?.propertyName ?? t('dashboard.noProperty')}</Text>
          {tenantProperty?.code && <Text size="sm">{tenantProperty.code}</Text>}
          <Text c="dimmed">{t('dashboard.applicationPending')}</Text>
        </Card>
      )}
      <Tabs defaultValue="information">
        <Tabs.List grow>
          <Tabs.Tab value="information">{t('dashboard.information')}</Tabs.Tab>
          <Tabs.Tab value="units">
            {t(isOwner ? 'dashboard.units' : 'dashboard.applications')}
          </Tabs.Tab>
          <Tabs.Tab value="payments">{t('dashboard.paymentsFines')}</Tabs.Tab>
          <Tabs.Tab value="parking">{t('dashboard.parking')}</Tabs.Tab>
          <Tabs.Tab value="maintenance">{t('dashboard.maintenance')}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="information" pt="md">
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
        </Tabs.Panel>
        <Tabs.Panel value="units" pt="md">
          {isOwner ? <TabContent label={t('dashboard.units')} /> : <ApplicationCenter />}
        </Tabs.Panel>
        <Tabs.Panel value="payments" pt="md">
          <PaymentPanel isOwner={isOwner} />
        </Tabs.Panel>
        <Tabs.Panel value="parking" pt="md">
          <TabContent label={t('dashboard.parking')} />
        </Tabs.Panel>
        <Tabs.Panel value="maintenance" pt="md">
          <MaintenancePanel />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
