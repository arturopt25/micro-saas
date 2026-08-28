import { useEffect, useState } from 'react';
import { Button, Group, Modal, NumberInput, Select, Stack, TextInput, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../../lib/api-client';

interface AvailableUnits {
  apartments: Array<{ id: string; code: string; building: { name: string } }>;
  houses: Array<{ id: string; code: string; residence: { name: string } }>;
}

export function ApplicationCenter(): React.JSX.Element {
  const { t } = useTranslation();
  const [units, setUnits] = useState<AvailableUnits>({ apartments: [], houses: [] });
  const [unit, setUnit] = useState<string | null>(null);
  const [unitType, setUnitType] = useState<'APARTMENT' | 'HOUSE'>('APARTMENT');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    void apiRequest<AvailableUnits>('/catalog/units?limit=50')
      .then(setUnits)
      .catch(() => undefined);
  }, []);
  const options =
    unitType === 'APARTMENT'
      ? units.apartments.map((item) => ({
          value: item.id,
          label: `${item.building.name} - ${item.code}`,
        }))
      : units.houses.map((item) => ({
          value: item.id,
          label: `${item.residence.name} - ${item.code}`,
        }));

  async function apply(): Promise<void> {
    if (!unit) return;
    await apiRequest('/tenant/applications', {
      method: 'POST',
      body: JSON.stringify({ unitType, unitId: unit, message }),
    });
    setSubmitted(true);
  }
  return submitted ? (
    <Text>{t('dashboard.applicationCreated')}</Text>
  ) : (
    <Stack>
      <Text c="dimmed">{t('dashboard.noProperty')}</Text>
      <Select
        label={t('dashboard.propertyType')}
        value={unitType}
        onChange={(value) => {
          setUnitType(value === 'HOUSE' ? 'HOUSE' : 'APARTMENT');
          setUnit(null);
        }}
        data={[
          { value: 'APARTMENT', label: t('dashboard.apartment') },
          { value: 'HOUSE', label: t('dashboard.house') },
        ]}
      />
      <Select
        label={t('dashboard.units')}
        value={unit}
        onChange={setUnit}
        data={options}
        searchable
      />
      <TextInput
        label={t('dashboard.message')}
        value={message}
        onChange={(event) => setMessage(event.currentTarget.value)}
      />
      <Button disabled={!unit} onClick={() => void apply()}>
        {t('dashboard.apply')}
      </Button>
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
