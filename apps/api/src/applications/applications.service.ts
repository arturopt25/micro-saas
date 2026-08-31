import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '@repo/db';
import type { PaginationInput } from '@repo/shared-types';

interface ApplicationInput {
  unitType: 'APARTMENT' | 'HOUSE';
  unitId: string;
  message?: string | undefined;
}

@Injectable()
export class ApplicationsService {
  async create(tenantUserId: string, input: ApplicationInput): Promise<unknown> {
    const existing = await prisma.occupancy.findFirst({
      where: { tenantUserId, status: 'ACTIVE' },
    });
    if (existing) throw new BadRequestException('TENANT_ALREADY_HAS_PROPERTY');
    const unit =
      input.unitType === 'APARTMENT'
        ? await prisma.apartment.findUnique({
            where: { id: input.unitId },
            include: { building: true },
          })
        : await prisma.house.findUnique({
            where: { id: input.unitId },
            include: { residence: true },
          });
    if (!unit || unit.status !== 'AVAILABLE') throw new BadRequestException('UNIT_NOT_AVAILABLE');
    const workspaceId = 'building' in unit ? unit.building.workspaceId : unit.residence.workspaceId;
    const pending = await prisma.application.findFirst({
      where: { applicantId: tenantUserId, status: 'PENDING' },
    });
    if (pending) throw new BadRequestException('APPLICATION_ALREADY_PENDING');
    return prisma.application.create({
      data: {
        applicantId: tenantUserId,
        workspaceId,
        message: input.message ?? null,
        ...(input.unitType === 'APARTMENT'
          ? { apartmentId: input.unitId }
          : { houseId: input.unitId }),
      },
    });
  }

  async listForTenant(tenantUserId: string, pagination: PaginationInput): Promise<unknown> {
    return prisma.application.findMany({
      where: { applicantId: tenantUserId },
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
      include: {
        apartment: { include: { building: true } },
        house: { include: { residence: true } },
      },
    });
  }

  async listForOwner(
    workspaceId: string | null,
    pagination: PaginationInput,
    status?: string | undefined,
  ): Promise<unknown> {
    if (!workspaceId) throw new ForbiddenException('WORKSPACE_MEMBERSHIP_REQUIRED');
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] as const;
    type ApplicationStatusType = (typeof validStatuses)[number];
    const statusFilter =
      status && validStatuses.includes(status as ApplicationStatusType)
        ? (status as ApplicationStatusType)
        : undefined;
    const where = {
      workspaceId,
      ...(statusFilter ? { status: statusFilter } : {}),
    };
    return prisma.application.findMany({
      where,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
      include: { applicant: true, apartment: { include: { building: true } }, house: { include: { residence: true } } },
    });
  }

  async listTenants(workspaceId: string | null): Promise<unknown> {
    if (!workspaceId) throw new ForbiddenException('WORKSPACE_MEMBERSHIP_REQUIRED');
    return prisma.workspaceMembership.findMany({
      where: { workspaceId, role: 'TENANT' },
      include: { user: true, workspace: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async review(
    ownerId: string,
    workspaceId: string | null,
    applicationId: string,
    status: 'APPROVED' | 'REJECTED',
    rejectionReason?: string | undefined,
  ): Promise<unknown> {
    if (!workspaceId) throw new ForbiddenException('WORKSPACE_MEMBERSHIP_REQUIRED');
    const application = await prisma.application.findFirst({
      where: { id: applicationId, workspaceId, status: 'PENDING' },
    });
    if (!application) throw new NotFoundException('APPLICATION_NOT_FOUND');
    if (status === 'REJECTED')
      return prisma.application.update({
        where: { id: applicationId },
        data: {
          status,
          rejectionReason: rejectionReason ?? null,
          reviewedBy: ownerId,
          reviewedAt: new Date(),
        },
      });
    return prisma.$transaction(async (transaction) => {
      if (application.apartmentId)
        await transaction.apartment.update({
          where: { id: application.apartmentId },
          data: { status: 'OCCUPIED' },
        });
      if (application.houseId)
        await transaction.house.update({
          where: { id: application.houseId },
          data: { status: 'OCCUPIED' },
        });
      await transaction.workspaceMembership.create({
        data: { workspaceId, userId: application.applicantId, role: 'TENANT' },
      });
      await transaction.occupancy.create({
        data: {
          workspaceId,
          tenantUserId: application.applicantId,
          apartmentId: application.apartmentId,
          houseId: application.houseId,
        },
      });
      return transaction.application.update({
        where: { id: applicationId },
        data: { status, reviewedBy: ownerId, reviewedAt: new Date() },
      });
    });
  }
}
