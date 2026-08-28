import { Body, Controller, Get, Inject, Param, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { z } from 'zod';
import { paginationSchema } from '@repo/shared-types';
import { PropertiesService } from './properties.service';

const buildingSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  numberOfFloors: z.number().int().positive(),
  description: z.string().optional(),
});
const residenceSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  numberOfHouses: z.number().int().positive(),
  description: z.string().optional(),
});
const unitSchema = z.object({
  code: z.string().min(1),
  floor: z.number().int().positive().optional(),
  lotNumber: z.string().optional(),
  sizeSquareMeters: z.number().positive(),
  bedrooms: z.number().int().nonnegative(),
  bathrooms: z.number().int().positive(),
  parkingSpaces: z.number().int().nonnegative().optional(),
  description: z.string().optional(),
});

@Controller()
export class PropertiesController {
  constructor(@Inject(PropertiesService) private readonly service: PropertiesService) {}

  @Get('catalog/properties') listCatalog(@Query() query: Record<string, unknown>) {
    return this.service.listProperties(null, paginationSchema.parse(query), false);
  }
  @Get('catalog/units') listUnits(@Query() query: Record<string, unknown>) {
    return this.service.listAvailableUnits(paginationSchema.parse(query));
  }
  @Get('owner/properties') listOwnerProperties(
    @Req() request: Request,
    @Query() query: Record<string, unknown>,
  ) {
    return this.service.listProperties(
      request.user.workspaceId,
      paginationSchema.parse(query),
      true,
    );
  }
  @Post('owner/buildings') createBuilding(@Req() request: Request, @Body() body: unknown) {
    return this.service.createBuilding(request.user.workspaceId, buildingSchema.parse(body));
  }
  @Post('owner/residences') createResidence(@Req() request: Request, @Body() body: unknown) {
    return this.service.createResidence(request.user.workspaceId, residenceSchema.parse(body));
  }
  @Post('owner/buildings/:id/apartments') createApartment(
    @Req() request: Request,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.service.createApartment(request.user.workspaceId, id, unitSchema.parse(body));
  }
  @Post('owner/residences/:id/houses') createHouse(
    @Req() request: Request,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.service.createHouse(request.user.workspaceId, id, unitSchema.parse(body));
  }
}
