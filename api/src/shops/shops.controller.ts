import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { CurrentUserPayload } from '../auth/types/jwt-payload';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { ShopsService } from './shops.service';

@Controller('shops')
@UseGuards(JwtAuthGuard)
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post()
  async create(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() body: CreateShopDto,
  ) {
    return await this.shopsService.create(currentUser.id, body);
  }

  @Get()
  async list(@CurrentUser() currentUser: CurrentUserPayload) {
    return await this.shopsService.listByOwner(currentUser.id);
  }

  @Get(':id')
  async findById(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    return await this.shopsService.findOwnedById(currentUser.id, id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id') id: string,
    @Body() body: UpdateShopDto,
  ) {
    return await this.shopsService.update(currentUser.id, id, body);
  }

  @Delete(':id')
  async remove(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    return await this.shopsService.remove(currentUser.id, id);
  }
}
