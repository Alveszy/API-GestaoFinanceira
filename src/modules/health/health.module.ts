import { Controller, Get, Module } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

// Identifica o endpoint de saúde no Swagger.
@ApiTags('Saúde')

// Define "health" como rota base.
@Controller('health')
class HealthController {

  // Recebe a conexão com o banco de dados.
  constructor(private db: DataSource) {}

  @Get()
  @ApiOperation({
    summary: 'Verifica disponibilidade da API e PostgreSQL',
  })
  async check() {

    // Executa uma consulta simples para verificar se o banco está funcionando.
    await this.db.query('SELECT 1');

    // Retorna o status da API, do banco e o horário da verificação.
    return {
      status: 'ok',
      database: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}

// Registra o controller dentro do módulo de saúde.
@Module({
  controllers: [HealthController],
})
export class HealthModule {}