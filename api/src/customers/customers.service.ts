import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShopsService } from '../shops/shops.service';

export interface CustomerSummary {
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
}

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shopsService: ShopsService,
  ) {}

  async list(ownerId: string, shopId?: string): Promise<CustomerSummary[]> {
    const resolvedShopId = await this.shopsService.resolveOwnedShopId(
      ownerId,
      shopId,
    );

    const orders = await this.prisma.order.findMany({
      where: { shopId: resolvedShopId },
      orderBy: { createdAt: 'desc' },
      select: {
        customerName: true,
        customerPhone: true,
        amountValue: true,
      },
    });

    const grouped = new Map<string, CustomerSummary>();

    for (const order of orders) {
      const existing = grouped.get(order.customerPhone);

      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += order.amountValue.toNumber();
        continue;
      }

      grouped.set(order.customerPhone, {
        name: order.customerName,
        phone: order.customerPhone,
        totalOrders: 1,
        totalSpent: order.amountValue.toNumber(),
      });
    }

    return Array.from(grouped.values());
  }
}
