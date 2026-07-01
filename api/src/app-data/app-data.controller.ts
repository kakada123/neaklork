import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { CurrentUserPayload } from '../auth/types/jwt-payload';
import { AppDataService } from './app-data.service';

@Controller('app')
@UseGuards(JwtAuthGuard)
export class AppDataController {
  constructor(private readonly appDataService: AppDataService) {}

  @Get('data')
  async getSeedData(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Query('shopId') shopId?: string,
  ) {
    return await this.appDataService.getSeedData(currentUser.id, shopId);
  }
}
