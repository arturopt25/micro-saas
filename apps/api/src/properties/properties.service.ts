import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '@repo/db';
import type { PaginationInput } from '@repo/shared-types';

interface CreateBuildingInput {
  name: string;
  address: string;
  numberOfFloors: number;
  description?: string | undefined;
}
interface CreateResidenceInput {
  name: string;
  address: string;
  numberOfHouses: number;
  description?: string | undefined;
}
interface CreateUnitInput {
  code: string;
  floor?: number | undefined;
  lotNumber?: string | undefined;
  sizeSquareMeters: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces?: number | undefined;
  description?: string | undefined;
}

function requireWorkspace(workspaceId: string | null): string {
  if (!workspaceId) throw new ForbiddenException('WORKSPACE_MEMBERSHIP_REQUIRED');
  return workspaceId;
}

@Injectable()
export class PropertiesService {
  async listProperties(
    workspaceId: string | null,
    pagination: PaginationInput,
    ownerOnly: boolean,
  ): Promise<unknown> {
    const where = ownerOnly
      ? { workspaceId: requireWorkspace(workspaceId) }
      : { status: 'ACTIVE' as const };
    const [buildings, residences] = await Promise.all([
      prisma.building.findMany({
        where,
        take: pagination.limit + 1,
        ...(pagination.cursor ? { skip: 1, cursor: { id: pagination.cursor } } : {}),
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { apartments: true } } },
      }),
      prisma.residence.findMany({
        where,
        take: pagination.limit + 1,
        ...(pagination.cursor ? { skip: 1, cursor: { id: pagination.cursor } } : {}),
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { houses: true } } },
      }),
    ]);
    return {
      buildings,
      residences,
      hasMore: buildings.length > pagination.limit || residences.length > pagination.limit,
    };
  }

  async createBuilding(workspaceId: string | null, input: CreateBuildingInput): Promise<unknown> {
    return prisma.building.create({
      data: {
        ...input,
        description: input.description ?? null,
        workspaceId: requireWorkspace(workspaceId),
      },
    });
  }

  async createResidence(workspaceId: string | null, input: CreateResidenceInput): Promise<unknown> {
    return prisma.residence.create({
      data: {
        ...input,
        description: input.description ?? null,
        workspaceId: requireWorkspace(workspaceId),
      },
    });
  }

  async createApartment(
    workspaceId: string | null,
    buildingId: string,
    input: CreateUnitInput,
  ): Promise<unknown> {
    const building = await prisma.building.findFirst({
      where: { id: buildingId, workspaceId: requireWorkspace(workspaceId) },
    });
    if (!building) throw new NotFoundException('BUILDING_NOT_FOUND');
    if (input.floor === undefined) throw new BadRequestException('FLOOR_REQUIRED');
    return prisma.apartment.create({
      data: {
        code: input.code,
        floor: input.floor,
        sizeSquareMeters: input.sizeSquareMeters,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        parkingSpaces: input.parkingSpaces ?? 0,
        description: input.description ?? null,
        buildingId,
      },
    });
  }

  async createHouse(
    workspaceId: string | null,
    residenceId: string,
    input: CreateUnitInput,
  ): Promise<unknown> {
    const residence = await prisma.residence.findFirst({
      where: { id: residenceId, workspaceId: requireWorkspace(workspaceId) },
    });
    if (!residence) throw new NotFoundException('RESIDENCE_NOT_FOUND');
    return prisma.house.create({
      data: {
        code: input.code,
        lotNumber: input.lotNumber ?? null,
        sizeSquareMeters: input.sizeSquareMeters,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        parkingSpaces: input.parkingSpaces ?? 0,
        description: input.description ?? null,
        residenceId,
      },
    });
  }

  async listAvailableUnits(pagination: PaginationInput): Promise<unknown> {
    const [apartments, houses] = await Promise.all([
      prisma.apartment.findMany({
        where: { status: 'AVAILABLE' },
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: { building: true },
      }),
      prisma.house.findMany({
        where: { status: 'AVAILABLE' },
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: { residence: true },
      }),
    ]);
    return {
      apartments,
      houses,
      hasMore: apartments.length === pagination.limit || houses.length === pagination.limit,
    };
  }
}
