import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '@repo/db';
import type { PaginationInput } from '@repo/shared-types';

interface PaymentInput {
  amount: number;
  currency?: string | undefined;
  reference: string;
  bank: string;
}
interface MaintenanceInput {
  title: string;
  description: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | undefined;
}

function requireRole(role: string, expected: 'OWNER' | 'TENANT'): void {
  if (role !== expected) throw new ForbiddenException('INSUFFICIENT_ROLE');
}

@Injectable()
export class OperationsService {
  async createPayment(userId: string, role: string, input: PaymentInput): Promise<unknown> {
    requireRole(role, 'TENANT');
    const occupancy = await prisma.occupancy.findFirst({
      where: { tenantUserId: userId, status: 'ACTIVE' },
    });
    if (!occupancy) throw new BadRequestException('ACTIVE_PROPERTY_REQUIRED');
    return prisma.payment.create({
      data: {
        ...input,
        currency: input.currency ?? 'USD',
        tenantUserId: userId,
        workspaceId: occupancy.workspaceId,
        apartmentId: occupancy.apartmentId,
        houseId: occupancy.houseId,
      },
    });
  }

  async listPayments(
    userId: string,
    role: string,
    workspaceId: string | null,
    pagination: PaginationInput,
  ): Promise<unknown> {
    const where = role === 'OWNER' ? { workspaceId: workspaceId ?? '' } : { tenantUserId: userId };
    return prisma.payment.findMany({
      where,
      take: pagination.limit,
      orderBy: { submittedAt: 'desc' },
    });
  }

  async reviewPayment(
    ownerId: string,
    role: string,
    workspaceId: string | null,
    paymentId: string,
    status: 'APPROVED' | 'REJECTED',
    rejectionReason?: string | undefined,
  ): Promise<unknown> {
    requireRole(role, 'OWNER');
    if (!workspaceId) throw new ForbiddenException('WORKSPACE_MEMBERSHIP_REQUIRED');
    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, workspaceId, status: 'PENDING_REVIEW' },
    });
    if (!payment) throw new NotFoundException('PAYMENT_NOT_FOUND');
    return prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        reviewedBy: ownerId,
        reviewedAt: new Date(),
        rejectionReason: rejectionReason ?? null,
      },
    });
  }

  async createMaintenance(userId: string, role: string, input: MaintenanceInput): Promise<unknown> {
    requireRole(role, 'TENANT');
    const occupancy = await prisma.occupancy.findFirst({
      where: { tenantUserId: userId, status: 'ACTIVE' },
    });
    if (!occupancy) throw new BadRequestException('ACTIVE_PROPERTY_REQUIRED');
    return prisma.maintenanceRequest.create({
      data: {
        ...input,
        priority: input.priority ?? 'MEDIUM',
        requesterId: userId,
        workspaceId: occupancy.workspaceId,
        apartmentId: occupancy.apartmentId,
        houseId: occupancy.houseId,
      },
    });
  }

  async listMaintenance(
    userId: string,
    role: string,
    workspaceId: string | null,
    pagination: PaginationInput,
  ): Promise<unknown> {
    const where = role === 'OWNER' ? { workspaceId: workspaceId ?? '' } : { requesterId: userId };
    return prisma.maintenanceRequest.findMany({
      where,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async listFines(
    userId: string,
    role: string,
    workspaceId: string | null,
    pagination: PaginationInput,
  ): Promise<unknown> {
    const where = role === 'OWNER' ? { workspaceId: workspaceId ?? '' } : { tenantUserId: userId };
    return prisma.fine.findMany({ where, take: pagination.limit, orderBy: { issuedAt: 'desc' } });
  }

  async listParking(
    userId: string,
    role: string,
    workspaceId: string | null,
    pagination: PaginationInput,
  ): Promise<unknown> {
    const where = role === 'OWNER' ? { workspaceId: workspaceId ?? '' } : { tenantUserId: userId };
    return prisma.parkingAccess.findMany({
      where,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}
