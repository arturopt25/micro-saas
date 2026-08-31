import { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { Role } from '@repo/shared-types';
import { ApplicationCenter, MaintenancePanel, PaymentPanel, TenantsPanel } from './OperationsPanels';
import { CreatePropertyModal } from './CreatePropertyModal';
import { apiRequest } from '../../lib/api-client';

interface OwnerProperties {
  buildings: Array<{ id: string; name: string }>;
  residences: Array<{ id: string; name: string }>;
}
interface TenantProperty {
  propertyName: string;
  code?: string;
}
interface TenantApplication {
  id: string;
  status: string;
  apartment: { id: string; code: string; building: { name: string } } | null;
  house: { id: string; code: string; residence: { name: string } } | null;
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
  const [tenantApplications, setTenantApplications] = useState<TenantApplication[]>([]);
  const [createPropertyOpened, setCreatePropertyOpened] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('information');
  const isOwner = role === 'OWNER';
  const ownerProperties = [
    ...properties.buildings.map((item) => ({ value: item.id, label: item.name })),
    ...properties.residences.map((item) => ({ value: item.id, label: item.name })),
  ];
  const hasPendingApplication = tenantApplications.some((app) => app.status === 'PENDING');
  const showApplicationCenter = !isOwner && !tenantProperty && !hasPendingApplication;

  useEffect(() => {
    if (showApplicationCenter && activeTab !== 'units') {
      setActiveTab('units');
    }
  }, [showApplicationCenter, activeTab]);
  useEffect(() => {
    if (!isOwner) {
      void apiRequest<TenantProperty | null>('/users/me/property')
        .then(setTenantProperty)
        .catch(() => undefined);
      void apiRequest<TenantApplication[]>('/tenant/applications?limit=50')
        .then(setTenantApplications)
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

  async function refreshOwnerProperties(): Promise<void> {
    const value = await apiRequest<OwnerProperties>('/owner/properties?limit=50');
    setProperties(value);
    setProperty(value.buildings[0]?.id ?? value.residences[0]?.id ?? '');
  }

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
        <Group align="end">
          <Select
            flex={1}
            label={t('dashboard.properties')}
            value={property}
            onChange={(value) => setProperty(value ?? '')}
            data={ownerProperties}
          />
          <Button onClick={() => setCreatePropertyOpened(true)}>
            {t('dashboard.newProperty')}
          </Button>
        </Group>
      ) : tenantProperty ? (
        <Card withBorder>
          <Text fw={600}>{tenantProperty.propertyName}</Text>
          {tenantProperty.code && <Text size="sm">{tenantProperty.code}</Text>}
        </Card>
      ) : hasPendingApplication ? (
        <Card withBorder>
          <Stack gap="xs">
            <Text fw={600}>{t('dashboard.applicationPending')}</Text>
            <Button
              variant="light"
              size="sm"
              onClick={() => setActiveTab('units')}
            >
              {t('dashboard.viewApplications')}
            </Button>
          </Stack>
        </Card>
      ) : null}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List grow>
          {!showApplicationCenter && (
            <Tabs.Tab value="information">{t('dashboard.information')}</Tabs.Tab>
          )}
          <Tabs.Tab value="units">
            {t(isOwner ? 'dashboard.units' : 'dashboard.applications')}
          </Tabs.Tab>
          {isOwner && <Tabs.Tab value="tenants">{t('dashboard.tenants')}</Tabs.Tab>}
          {!showApplicationCenter && (
            <Tabs.Tab value="payments">{t('dashboard.paymentsFines')}</Tabs.Tab>
          )}
          {!showApplicationCenter && (
            <Tabs.Tab value="parking">{t('dashboard.parking')}</Tabs.Tab>
          )}
          {!showApplicationCenter && (
            <Tabs.Tab value="maintenance">{t('dashboard.maintenance')}</Tabs.Tab>
          )}
        </Tabs.List>
        {!showApplicationCenter && (
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
        )}
        <Tabs.Panel value="units" pt="md">
          {isOwner ? <TabContent label={t('dashboard.units')} /> : <ApplicationCenter />}
        </Tabs.Panel>
        {isOwner && (
          <Tabs.Panel value="tenants" pt="md">
            <TenantsPanel />
          </Tabs.Panel>
        )}
        {!showApplicationCenter && (
          <Tabs.Panel value="payments" pt="md">
            <PaymentPanel isOwner={isOwner} />
          </Tabs.Panel>
        )}
        {!showApplicationCenter && (
          <Tabs.Panel value="parking" pt="md">
            <TabContent label={t('dashboard.parking')} />
          </Tabs.Panel>
        )}
        {!showApplicationCenter && (
          <Tabs.Panel value="maintenance" pt="md">
            <MaintenancePanel />
          </Tabs.Panel>
        )}
      </Tabs>
      {isOwner && (
        <CreatePropertyModal
          opened={createPropertyOpened}
          onClose={() => setCreatePropertyOpened(false)}
          onCreated={() => void refreshOwnerProperties()}
        />
      )}
    </Stack>
  );
}
