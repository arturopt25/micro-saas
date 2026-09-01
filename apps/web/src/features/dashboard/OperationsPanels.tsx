import { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Group,
  Modal,
  NumberInput,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../../lib/api-client';

interface CatalogProperties {
  buildings: Array<{ id: string; name: string; address: string; _count: { apartments: number } }>;
  residences: Array<{ id: string; name: string; address: string; _count: { houses: number } }>;
}
interface AvailableUnits {
  apartments: Array<{ id: string; code: string; floor: number; building: { name: string } }>;
  houses: Array<{ id: string; code: string; lotNumber: string | null; residence: { name: string } }>;
}

export function ApplicationCenter(): React.JSX.Element {
  const { t } = useTranslation();
  const [catalog, setCatalog] = useState<CatalogProperties | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [selectedPropertyType, setSelectedPropertyType] = useState<'building' | 'residence' | null>(
    null,
  );
  const [units, setUnits] = useState<AvailableUnits>({ apartments: [], houses: [] });
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    void apiRequest<CatalogProperties>('/catalog/properties?limit=50')
      .then(setCatalog)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!selectedProperty) {
      setUnits({ apartments: [], houses: [] });
      setSelectedUnit(null);
      return;
    }
    void apiRequest<AvailableUnits>(
      `/catalog/units?limit=50&propertyId=${selectedProperty}`,
    ).then(setUnits);
  }, [selectedProperty]);

  async function apply(): Promise<void> {
    if (!selectedUnit || !selectedPropertyType) return;
    const unitType = selectedPropertyType === 'building' ? 'APARTMENT' : 'HOUSE';
    await apiRequest('/tenant/applications', {
      method: 'POST',
      body: JSON.stringify({ unitType, unitId: selectedUnit, message }),
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Card withBorder p="xl">
        <Stack align="center" gap="md">
          <Text size="lg" fw={600}>
            {t('dashboard.applicationCreated')}
          </Text>
          <Text c="dimmed">{t('dashboard.applicationPending')}</Text>
        </Stack>
      </Card>
    );
  }

  if (selectedProperty && selectedPropertyType) {
    const unitOptions =
      selectedPropertyType === 'building'
        ? units.apartments.map((item) => ({
            value: item.id,
            label: `${t('dashboard.floor')} ${item.floor} - ${t('dashboard.unit')} ${item.code}`,
          }))
        : units.houses.map((item) => ({
            value: item.id,
            label: `${t('dashboard.unit')} ${item.code}${item.lotNumber ? ` - ${item.lotNumber}` : ''}`,
          }));

    return (
      <Stack>
        <Group justify="space-between">
          <Button variant="subtle" onClick={() => { setSelectedProperty(null); setSelectedPropertyType(null); }}>
            {t('dashboard.backToProperties')}
          </Button>
          <Badge size="lg">
            {catalog
              ? selectedPropertyType === 'building'
                ? catalog.buildings.find((b) => b.id === selectedProperty)?.name
                : catalog.residences.find((r) => r.id === selectedProperty)?.name
              : ''}
          </Badge>
        </Group>
        <Title order={4}>{t('dashboard.selectUnit')}</Title>
        {unitOptions.length === 0 ? (
          <Card withBorder>
            <Text c="dimmed">{t('dashboard.noUnitsAvailable')}</Text>
          </Card>
        ) : (
          <>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
              {unitOptions.map((option) => (
                <Card
                  key={option.value}
                  withBorder
                  p="md"
                  style={{
                    cursor: 'pointer',
                    borderColor: selectedUnit === option.value ? 'var(--mantine-color-blue-6)' : undefined,
                    backgroundColor: selectedUnit === option.value ? 'var(--mantine-color-blue-0)' : undefined,
                  }}
                  onClick={() => setSelectedUnit(option.value)}
                >
                  <Text fw={500}>{option.label}</Text>
                  <Text size="sm" c="dimmed">{t('dashboard.available')}</Text>
                </Card>
              ))}
            </SimpleGrid>
            <TextInput
              label={t('dashboard.message')}
              placeholder={t('dashboard.messagePlaceholder')}
              value={message}
              onChange={(event) => setMessage(event.currentTarget.value)}
            />
            <Button disabled={!selectedUnit} onClick={() => void apply()}>
              {t('dashboard.apply')}
            </Button>
          </>
        )}
      </Stack>
    );
  }

  return (
    <Stack>
      <Title order={4}>{t('dashboard.selectProperty')}</Title>
      {!catalog ? (
        <Text c="dimmed">{t('common.loading')}</Text>
      ) : (
        <>
          {catalog.buildings.length > 0 && (
            <>
              <Text fw={600}>{t('dashboard.buildings')}</Text>
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
                {catalog.buildings.map((building) => (
                  <Card
                    key={building.id}
                    withBorder
                    p="md"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedProperty(building.id);
                      setSelectedPropertyType('building');
                    }}
                  >
                    <Stack gap="xs">
                      <Text fw={600}>{building.name}</Text>
                      <Text size="sm" c="dimmed">{building.address}</Text>
                      <Group justify="space-between">
                        <Badge variant="light">{t('dashboard.apartments')}</Badge>
                        <Text size="sm">{building._count.apartments} {t('dashboard.available')}</Text>
                      </Group>
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>
            </>
          )}
          {catalog.residences.length > 0 && (
            <>
              <Text fw={600} mt="md">{t('dashboard.residences')}</Text>
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
                {catalog.residences.map((residence) => (
                  <Card
                    key={residence.id}
                    withBorder
                    p="md"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedProperty(residence.id);
                      setSelectedPropertyType('residence');
                    }}
                  >
                    <Stack gap="xs">
                      <Text fw={600}>{residence.name}</Text>
                      <Text size="sm" c="dimmed">{residence.address}</Text>
                      <Group justify="space-between">
                        <Badge variant="light">{t('dashboard.houses')}</Badge>
                        <Text size="sm">{residence._count.houses} {t('dashboard.available')}</Text>
                      </Group>
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>
            </>
          )}
          {catalog.buildings.length === 0 && catalog.residences.length === 0 && (
            <Card withBorder>
              <Text c="dimmed">{t('dashboard.noPropertiesAvailable')}</Text>
            </Card>
          )}
        </>
      )}
    </Stack>
  );
}

export function PaymentPanel({ isOwner }: { isOwner: boolean }): React.JSX.Element {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  const [amount, setAmount] = useState<number | string>(0);
  const [reference, setReference] = useState('');
  const [bank, setBank] = useState('');

  async function submit(): Promise<void> {
    await apiRequest('/tenant/payments', {
      method: 'POST',
      body: JSON.stringify({ amount: Number(amount), reference, bank }),
    });
    setOpened(false);
    notifications.show({ message: t('dashboard.paymentSubmitted') });
  }

  if (isOwner) return <Text c="dimmed">{t('dashboard.paymentsOwner')}</Text>;
  return (
    <Stack>
      <Group justify="space-between">
        <Text c="dimmed">{t('dashboard.paymentsTenant')}</Text>
        <Button onClick={() => setOpened(true)}>{t('dashboard.registerPayment')}</Button>
      </Group>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={t('dashboard.registerPayment')}
      >
        <Stack>
          <NumberInput label={t('dashboard.amount')} value={amount} onChange={setAmount} min={0} />
          <TextInput
            label={t('dashboard.reference')}
            value={reference}
            onChange={(event) => setReference(event.currentTarget.value)}
          />
          <TextInput
            label={t('dashboard.bank')}
            value={bank}
            onChange={(event) => setBank(event.currentTarget.value)}
          />
          <Button onClick={() => void submit()}>{t('common.save')}</Button>
        </Stack>
      </Modal>
    </Stack>
  );
}

export function MaintenancePanel(): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <Group justify="space-between">
      <Text c="dimmed">{t('dashboard.maintenanceEmpty')}</Text>
      <Button variant="light">{t('dashboard.newMaintenance')}</Button>
    </Group>
  );
}

interface Application {
  id: string;
  status: string;
  message: string | null;
  rejectionReason: string | null;
  createdAt: string;
  applicant: { id: string; name: string; email: string };
  apartment: { id: string; code: string; building: { name: string } } | null;
  house: { id: string; code: string; residence: { name: string } } | null;
}
interface TenantMember {
  id: string;
  role: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

export function TenantsPanel(): React.JSX.Element {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string | null>('pending');
  const [applications, setApplications] = useState<Application[]>([]);
  const [tenants, setTenants] = useState<TenantMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load(): Promise<void> {
      try {
        const [apps, tenantList] = await Promise.all([
          apiRequest<Application[]>('/owner/applications?limit=50').catch(() => []),
          apiRequest<TenantMember[]>('/owner/tenants').catch(() => []),
        ]);
        if (mounted) {
          setApplications(apps);
          setTenants(tenantList);
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => { mounted = false; };
  }, []);

  async function loadApplications(): Promise<void> {
    setLoading(true);
    try {
      const data = await apiRequest<Application[]>('/owner/applications?limit=50');
      setApplications(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function loadTenants(): Promise<void> {
    try {
      const data = await apiRequest<TenantMember[]>('/owner/tenants');
      setTenants(data);
    } catch {
      // ignore
    }
  }

  async function approveApplication(id: string): Promise<void> {
    await apiRequest(`/owner/applications/${id}/approve`, { method: 'PATCH' });
    notifications.show({ message: t('dashboard.applicationApproved') });
    void loadApplications();
    void loadTenants();
  }

  async function rejectApplication(id: string): Promise<void> {
    await apiRequest(`/owner/applications/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({}),
    });
    notifications.show({ message: t('dashboard.applicationRejected') });
    void loadApplications();
  }

  const pending = applications.filter((a) => a.status === 'PENDING');
  const approved = applications.filter((a) => a.status === 'APPROVED');
  const rejected = applications.filter((a) => a.status === 'REJECTED');

  function renderApplicationList(items: Application[], showActions: boolean): React.JSX.Element {
    if (items.length === 0) {
      return <Text c="dimmed">{t('dashboard.noApplications')}</Text>;
    }
    return (
      <Stack>
        {items.map((app) => {
          const unitLabel = app.apartment
            ? `${app.apartment.building.name} - ${app.apartment.code}`
            : app.house
              ? `${app.house.residence.name} - ${app.house.code}`
              : '';
          return (
            <Card key={app.id} withBorder p="md">
              <Group justify="space-between" wrap="nowrap">
                <Stack gap={4} flex={1}>
                  <Text fw={600}>{app.applicant.name}</Text>
                  <Text size="sm" c="dimmed">{app.applicant.email}</Text>
                  <Text size="sm">{unitLabel}</Text>
                  {app.message && <Text size="sm" c="dimmed">"{app.message}"</Text>}
                  {app.rejectionReason && (
                    <Text size="sm" c="red">{app.rejectionReason}</Text>
                  )}
                  <Text size="xs" c="dimmed">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </Text>
                </Stack>
                {showActions && (
                  <Group gap="xs">
                    <Button size="xs" color="green" onClick={() => void approveApplication(app.id)}>
                      {t('dashboard.approve')}
                    </Button>
                    <Button size="xs" color="red" variant="light" onClick={() => void rejectApplication(app.id)}>
                      {t('dashboard.reject')}
                    </Button>
                  </Group>
                )}
              </Group>
            </Card>
          );
        })}
      </Stack>
    );
  }

  return (
    <Stack>
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="pending">
            {t('dashboard.pending')} ({pending.length})
          </Tabs.Tab>
          <Tabs.Tab value="accepted">
            {t('dashboard.accepted')} ({approved.length})
          </Tabs.Tab>
          <Tabs.Tab value="rejected">
            {t('dashboard.rejected')} ({rejected.length})
          </Tabs.Tab>
          <Tabs.Tab value="all">
            {t('dashboard.allTenants')} ({tenants.length})
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="pending" pt="md">
          {loading ? <Text c="dimmed">{t('common.loading')}</Text> : renderApplicationList(pending, true)}
        </Tabs.Panel>
        <Tabs.Panel value="accepted" pt="md">
          {loading ? <Text c="dimmed">{t('common.loading')}</Text> : renderApplicationList(approved, false)}
        </Tabs.Panel>
        <Tabs.Panel value="rejected" pt="md">
          {loading ? <Text c="dimmed">{t('common.loading')}</Text> : renderApplicationList(rejected, false)}
        </Tabs.Panel>
        <Tabs.Panel value="all" pt="md">
          {tenants.length === 0 ? (
            <Text c="dimmed">{t('dashboard.noTenants')}</Text>
          ) : (
            <Stack>
              {tenants.map((member) => (
                <Card key={member.id} withBorder p="md">
                  <Group justify="space-between">
                    <Stack gap={4}>
                      <Text fw={600}>{member.user.name}</Text>
                      <Text size="sm" c="dimmed">{member.user.email}</Text>
                    </Stack>
                    <Text size="sm" c="dimmed">
                      {t('dashboard.since')} {new Date(member.createdAt).toLocaleDateString()}
                    </Text>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
