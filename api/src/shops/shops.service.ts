import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

export interface ShopInfo {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ShopsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateShopDto): Promise<ShopInfo> {
    return await this.prisma.shop.create({
      data: {
        ownerId,
        name: dto.name,
        description: dto.description,
      },
    });
  }

  async listByOwner(ownerId: string): Promise<ShopInfo[]> {
    return await this.prisma.shop.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOwnedById(ownerId: string, id: string): Promise<ShopInfo> {
    const shop = await this.prisma.shop.findFirst({
      where: { id, ownerId },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    return shop;
  }

  async update(
    ownerId: string,
    id: string,
    dto: UpdateShopDto,
  ): Promise<ShopInfo> {
    await this.findOwnedById(ownerId, id);

    return await this.prisma.shop.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive,
      },
    });
  }

  async remove(ownerId: string, id: string): Promise<ShopInfo> {
    await this.findOwnedById(ownerId, id);

    return await this.prisma.shop.delete({ where: { id } });
  }

  async resolveOwnedShopId(ownerId: string, shopId?: string): Promise<string> {
    if (shopId) {
      const shop = await this.prisma.shop.findFirst({
        where: { id: shopId, ownerId },
        select: { id: true },
      });

      if (!shop) {
        throw new ForbiddenException('Shop access denied');
      }

      return shop.id;
    }

    const firstShop = await this.prisma.shop.findFirst({
      where: { ownerId, isActive: true },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });

    if (!firstShop) {
      throw new NotFoundException('No shop found. Please create a shop first.');
    }

    return firstShop.id;
  }
}
