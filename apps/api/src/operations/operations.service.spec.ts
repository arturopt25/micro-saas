import { describe, expect, it, vi } from 'vitest';
import { OperationsService } from './operations.service';

vi.mock('@repo/db', () => ({ prisma: {} }));

describe('OperationsService', () => {
  it('rejects tenant-only payment creation for an owner', async () => {
    const service = new OperationsService();
    await expect(
      service.createPayment('owner-1', 'OWNER', { amount: 10, reference: 'ref', bank: 'bank' }),
    ).rejects.toThrow('INSUFFICIENT_ROLE');
  });
});
