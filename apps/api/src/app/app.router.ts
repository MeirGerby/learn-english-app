import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthRouter {
  @Get('/health')
  health() {
    return {
      status: 'ok',
    };
  }
}
