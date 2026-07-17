import { Controller, Get } from '@nestjs/common';

import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'Health check',
    description:
      'Checks whether backend service is running.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Backend is running successfully.',
    schema: {
      example: {
        status: 'OK',
        message: 'Backend is running',
      },
    },
  })
  check() {
    return {
      status: 'OK',
      message: 'Backend is running',
    };
  }
}