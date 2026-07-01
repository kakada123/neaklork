import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShopsService } from '../shops/shops.service';
import { RawOrder, toRawOrder } from './orders.types';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shopsService: ShopsService,
  ) {}

  async list(ownerId: string, shopId?: string): Promise<RawOrder[]> {
    const resolvedShopId = await this.shopsService.resolveOwnedShopId(
      ownerId,
      shopId,
    );

    const orders = await this.prisma.order.findMany({
      where: { shopId: resolvedShopId },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(toRawOrder);
  }
}
