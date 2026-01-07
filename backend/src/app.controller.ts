import { Controller, Get, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('profile')
  getProfile(@Request() req) {
    const user = req.user;
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      branch_id: user.branch_id,
      roles: user.roles?.map((role) => ({
        id: role.id,
        name: role.name,
        permissions: role.permissions?.map((p) => p.key) || [],
      })) || [],
    };
  }
}
