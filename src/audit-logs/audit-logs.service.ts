import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  AuditAction,
  AuditEntityType,
  AuditLog,
} from './entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  async create(data: {
    adminId: string;
    action: AuditAction;
    entityType: AuditEntityType;
    entityId: string;
    reason?: string;
    metadata?: Record<string, unknown>;
  }): Promise<AuditLog> {
    const log = this.auditRepository.create({
      adminId: data.adminId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      reason: data.reason ?? null,
      metadata: data.metadata ?? null,
    });

    return this.auditRepository.save(log);
  }
}
