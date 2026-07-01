import {
  Body,
  Controller,
  Delete,
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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() body: CreateProductDto,
    @Query('shopId') shopId?: string,
  ) {
    return await this.productsService.create(currentUser.id, body, shopId);
  }

  @Get()
  async list(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Query('shopId') shopId?: string,
  ) {
    return await this.productsService.list(currentUser.id, shopId);
  }

  @Get(':id')
  async findById(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    return await this.productsService.findById(currentUser.id, id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id') id: string,
    @Body() body: UpdateProductDto,
  ) {
    return await this.productsService.update(currentUser.id, id, body);
  }

  @Delete(':id')
  async remove(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    return await this.productsService.remove(currentUser.id, id);
  }
}
