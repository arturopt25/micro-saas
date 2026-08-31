import { useMemo, useState } from 'react';
import {
  Button,
  Group,
  Modal,
  NumberInput,
  ScrollArea,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../../lib/api-client';

export function generateApartmentCodes(floors: number, apartmentsPerFloor: number): string[] {
  return Array.from(
    { length: floors * apartmentsPerFloor },
    (_, index) =>
      `${Math.floor(index / apartmentsPerFloor) + 1}${String.fromCharCode(65 + (index % apartmentsPerFloor))}`,
  );
}

export function generateHouseCodes(numberOfHouses: number): string[] {
  return Array.from({ length: numberOfHouses }, (_, index) => String(index + 1));
}

interface CreatePropertyModalProps {
  opened: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreatePropertyModal({
  opened,
  onClose,
  onCreated,
}: CreatePropertyModalProps): React.JSX.Element {
  const { t } = useTranslation();
  const [type, setType] = useState<'BUILDING' | 'RESIDENCE'>('BUILDING');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [floors, setFloors] = useState<number | string>(1);
  const [perFloor, setPerFloor] = useState<number | string>(1);
  const [houses, setHouses] = useState<number | string>(1);
  const [size, setSize] = useState<number | string>(60);
  const [bedrooms, setBedrooms] = useState<number | string>(2);
  const [bathrooms, setBathrooms] = useState<number | string>(1);
  const [parking, setParking] = useState<number | string>(0);
  const [saving, setSaving] = useState(false);
  const codes = useMemo(
    () =>
      type === 'BUILDING'
        ? generateApartmentCodes(Number(floors), Number(perFloor))
        : generateHouseCodes(Number(houses)),
    [type, floors, perFloor, houses],
  );

  async function submit(): Promise<void> {
    setSaving(true);
    try {
      const defaults = {
        sizeSquareMeters: Number(size),
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        parkingSpaces: Number(parking),
      };
      const payload =
        type === 'BUILDING'
          ? {
              name,
              address,
              numberOfFloors: Number(floors),
              apartmentsPerFloor: Number(perFloor),
              defaults,
            }
          : { name, address, numberOfHouses: Number(houses), defaults };
      await apiRequest(`/owner/properties/${type === 'BUILDING' ? 'building' : 'residence'}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      notifications.show({ message: t('dashboard.propertyCreated') });
      onClose();
      onCreated();
    } catch {
      notifications.show({ color: 'red', message: t('dashboard.propertyCreateError') });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title={t('dashboard.newProperty')} size="lg">
      <Stack>
        <Select
          label={t('dashboard.propertyType')}
          value={type}
          onChange={(value) => setType(value === 'RESIDENCE' ? 'RESIDENCE' : 'BUILDING')}
          data={[
            { value: 'BUILDING', label: t('dashboard.building') },
            { value: 'RESIDENCE', label: t('dashboard.residence') },
          ]}
        />
        <TextInput
          label={t('dashboard.name')}
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          required
        />
        <TextInput
          label={t('dashboard.address')}
          value={address}
          onChange={(event) => setAddress(event.currentTarget.value)}
          required
        />
        {type === 'BUILDING' ? (
          <Group grow>
            <NumberInput
              label={t('dashboard.floors')}
              value={floors}
              onChange={setFloors}
              min={1}
              max={40}
            />
            <NumberInput
              label={t('dashboard.apartmentsPerFloor')}
              value={perFloor}
              onChange={setPerFloor}
              min={1}
              max={10}
            />
          </Group>
        ) : (
          <NumberInput
            label={t('dashboard.houses')}
            value={houses}
            onChange={setHouses}
            min={1}
            max={200}
          />
        )}
        <Group grow>
          <NumberInput label={t('dashboard.size')} value={size} onChange={setSize} min={1} />
          <NumberInput
            label={t('dashboard.bedrooms')}
            value={bedrooms}
            onChange={setBedrooms}
            min={0}
          />
          <NumberInput
            label={t('dashboard.bathrooms')}
            value={bathrooms}
            onChange={setBathrooms}
            min={1}
          />
          <NumberInput
            label={t('dashboard.parkingSpaces')}
            value={parking}
            onChange={setParking}
            min={0}
          />
        </Group>
        <Text fw={600}>
          {t('dashboard.preview')} ({codes.length})
        </Text>
        <ScrollArea h={100}>
          <Text size="sm">{codes.join(', ')}</Text>
        </ScrollArea>
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            loading={saving}
            disabled={!name.trim() || !address.trim() || codes.length === 0 || codes.length > 500}
            onClick={() => void submit()}
          >
            {t('common.create')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
