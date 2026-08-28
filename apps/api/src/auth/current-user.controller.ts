import { Controller, Get, Inject, Req } from '@nestjs/common';
import type { Request } from 'express';
import { prisma } from '@repo/db';

@Controller('users/me')
export class CurrentUserController {
  constructor(@Inject('PRISMA') private readonly database: typeof prisma) {}

  @Get()
  getCurrentUser(@Req() request: Request) {
    return request.user;
  }

  @Get('property')
  async getCurrentProperty(@Req() request: Request) {
    const occupancy = await this.database.occupancy.findFirst({
      where: { tenantUserId: request.user.id, status: 'ACTIVE' },
      include: {
        apartment: { include: { building: true } },
        house: { include: { residence: true } },
      },
    });
    if (!occupancy) return null;
    return occupancy.apartment
      ? {
          type: 'APARTMENT',
          code: occupancy.apartment.code,
          propertyName: occupancy.apartment.building.name,
        }
      : {
          type: 'HOUSE',
          code: occupancy.house?.code,
          propertyName: occupancy.house?.residence.name,
        };
  }
}
