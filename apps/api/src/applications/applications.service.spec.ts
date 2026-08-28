import { describe, expect, it, vi } from 'vitest';
import { ApplicationsService } from './applications.service';

vi.mock('@repo/db', () => ({
  prisma: {
    occupancy: { findFirst: vi.fn().mockResolvedValue(null) },
    apartment: { findUnique: vi.fn().mockResolvedValue(null) },
  },
}));

describe('ApplicationsService', () => {
  it('rejects applications for unavailable units', async () => {
    const service = new ApplicationsService();
    await expect(
      service.create('tenant-1', { unitType: 'APARTMENT', unitId: 'missing' }),
    ).rejects.toThrow('UNIT_NOT_AVAILABLE');
  });
});
