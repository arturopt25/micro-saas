import { Body, Controller, Get, Inject, Param, Patch, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { z } from 'zod';
import { paginationSchema } from '@repo/shared-types';
import { OperationsService } from './operations.service';

const paymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3).optional(),
  reference: z.string().min(1),
  bank: z.string().min(1),
});
const maintenanceSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
});
const rejectionSchema = z.object({ rejectionReason: z.string().max(1000).optional() });

@Controller()
export class OperationsController {
  constructor(@Inject(OperationsService) private readonly service: OperationsService) {}
  @Post('tenant/payments') createPayment(@Req() request: Request, @Body() body: unknown) {
    return this.service.createPayment(
      request.user.id,
      request.user.role,
      paymentSchema.parse(body),
    );
  }
  @Get('tenant/payments') tenantPayments(
    @Req() request: Request,
    @Query() query: Record<string, unknown>,
  ) {
    return this.service.listPayments(
      request.user.id,
      request.user.role,
      request.user.workspaceId,
      paginationSchema.parse(query),
    );
  }
  @Get('owner/payments') ownerPayments(
    @Req() request: Request,
    @Query() query: Record<string, unknown>,
  ) {
    return this.service.listPayments(
      request.user.id,
      request.user.role,
      request.user.workspaceId,
      paginationSchema.parse(query),
    );
  }
  @Patch('owner/payments/:id/approve') approvePayment(
    @Req() request: Request,
    @Param('id') id: string,
  ) {
    return this.service.reviewPayment(
      request.user.id,
      request.user.role,
      request.user.workspaceId,
      id,
      'APPROVED',
    );
  }
  @Patch('owner/payments/:id/reject') rejectPayment(
    @Req() request: Request,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.service.reviewPayment(
      request.user.id,
      request.user.role,
      request.user.workspaceId,
      id,
      'REJECTED',
      rejectionSchema.parse(body).rejectionReason,
    );
  }
  @Post('tenant/maintenance') createMaintenance(@Req() request: Request, @Body() body: unknown) {
    return this.service.createMaintenance(
      request.user.id,
      request.user.role,
      maintenanceSchema.parse(body),
    );
  }
  @Get('tenant/maintenance') tenantMaintenance(
    @Req() request: Request,
    @Query() query: Record<string, unknown>,
  ) {
    return this.service.listMaintenance(
      request.user.id,
      request.user.role,
      request.user.workspaceId,
      paginationSchema.parse(query),
    );
  }
  @Get('owner/maintenance') ownerMaintenance(
    @Req() request: Request,
    @Query() query: Record<string, unknown>,
  ) {
    return this.service.listMaintenance(
      request.user.id,
      request.user.role,
      request.user.workspaceId,
      paginationSchema.parse(query),
    );
  }
  @Get('tenant/fines') tenantFines(
    @Req() request: Request,
    @Query() query: Record<string, unknown>,
  ) {
    return this.service.listFines(
      request.user.id,
      request.user.role,
      request.user.workspaceId,
      paginationSchema.parse(query),
    );
  }
  @Get('owner/fines') ownerFines(@Req() request: Request, @Query() query: Record<string, unknown>) {
    return this.service.listFines(
      request.user.id,
      request.user.role,
      request.user.workspaceId,
      paginationSchema.parse(query),
    );
  }
  @Get('tenant/parking') tenantParking(
    @Req() request: Request,
    @Query() query: Record<string, unknown>,
  ) {
    return this.service.listParking(
      request.user.id,
      request.user.role,
      request.user.workspaceId,
      paginationSchema.parse(query),
    );
  }
  @Get('owner/parking') ownerParking(
    @Req() request: Request,
    @Query() query: Record<string, unknown>,
  ) {
    return this.service.listParking(
      request.user.id,
      request.user.role,
      request.user.workspaceId,
      paginationSchema.parse(query),
    );
  }
}
