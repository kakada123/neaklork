import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { CurrentUserPayload } from '../auth/types/jwt-payload';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async list(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Query() query: ListOrdersQueryDto,
  ) {
    return await this.ordersService.list(currentUser.id, query);
  }

  @Post()
  async create(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() body: CreateOrderDto,
    @Query('shopId') shopId?: string,
  ) {
    return await this.ordersService.create(currentUser.id, body, shopId);
  }

  @Patch(':id/status')
  async updateStatus(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id') id: string,
    @Body() body: UpdateOrderStatusDto,
  ) {
    return await this.ordersService.updateStatus(currentUser.id, id, body);
  }
}
