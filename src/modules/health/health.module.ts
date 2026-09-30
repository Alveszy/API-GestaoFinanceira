import { Controller, Get, Module } from '@nestjs/common'; import { ApiOperation, ApiTags } from '@nestjs/swagger'; import { DataSource } from 'typeorm';
@ApiTags('Saúde') @Controller('health') class HealthController { constructor(private db: DataSource) {} @Get() @ApiOperation({ summary: 'Verifica disponibilidade da API e PostgreSQL' }) async check() { await this.db.query('SELECT 1'); return { status: 'ok', database: 'ok', timestamp: new Date().toISOString() }; } }
@Module({ controllers: [HealthController] }) export class HealthModule {}
