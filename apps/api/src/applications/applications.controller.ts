import { Body, Controller, Get, Inject, Param, Patch, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { z } from 'zod';
import { paginationSchema } from '@repo/shared-types';
import { ApplicationsService } from './applications.service';

const applicationSchema = z.object({
  unitType: z.enum(['APARTMENT', 'HOUSE']),
  unitId: z.string().min(1),
  message: z.string().max(1000).optional(),
});
const reviewSchema = z.object({ rejectionReason: z.string().max(1000).optional() });

@Controller()
export class ApplicationsController {
  constructor(@Inject(ApplicationsService) private readonly service: ApplicationsService) {}
  @Post('tenant/applications') create(@Req() request: Request, @Body() body: unknown) {
    return this.service.create(request.user.id, applicationSchema.parse(body));
  }
  @Get('tenant/applications') listTenant(
    @Req() request: Request,
    @Query() query: Record<string, unknown>,
  ) {
    return this.service.listForTenant(request.user.id, paginationSchema.parse(query));
  }
  @Get('owner/applications') listOwner(
    @Req() request: Request,
    @Query() query: Record<string, unknown>,
  ) {
    return this.service.listForOwner(request.user.workspaceId, paginationSchema.parse(query));
  }
  @Patch('owner/applications/:id/approve') approve(
    @Req() request: Request,
    @Param('id') id: string,
  ) {
    return this.service.review(request.user.id, request.user.workspaceId, id, 'APPROVED');
  }
  @Patch('owner/applications/:id/reject') reject(
    @Req() request: Request,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.service.review(
      request.user.id,
      request.user.workspaceId,
      id,
      'REJECTED',
      reviewSchema.parse(body).rejectionReason,
    );
  }
}
