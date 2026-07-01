import { Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { ShopsService } from '../shops/shops.service';
import {
  RawOrder,
  statusOptions as orderStatusOptions,
} from '../orders/orders.types';

export interface AppSeedData {
  shop: {
    name: string;
    id: string;
    owner: string;
  };
  rawOrders: RawOrder[];
  statusOptions: Array<{
    key: RawOrder['status'];
    label: string;
    icon: string;
  }>;
  reminderTemplates: Array<{
    title: string;
    message: string;
  }>;
}

const reminderTemplates: AppSeedData['reminderTemplates'] = [
  {
    title: 'Khmer reminder',
    message:
      'សួស្តីបង 🙏\nOrder របស់បងនៅមិនទាន់ទូទាត់ទេ។\nបងអាចផ្ញើ slip មកខ្ញុំបានណា។\nអរគុណច្រើន ❤️',
  },
  {
    title: 'English reminder',
    message:
      'Hi 👋\n\nThis is a friendly reminder that payment for your order is due.\nPlease send it to the payment info.\nThank you! ❤️',
  },
];

@Injectable()
export class AppDataService {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly shopsService: ShopsService,
  ) {}

  async getOrders(ownerId: string, shopId?: string): Promise<RawOrder[]> {
    return await this.ordersService.list(ownerId, { shopId });
  }

  async getSeedData(ownerId: string, shopId?: string): Promise<AppSeedData> {
    const resolvedShopId = await this.shopsService.resolveOwnedShopId(
      ownerId,
      shopId,
    );
    const shop = await this.shopsService.findOwnedById(ownerId, resolvedShopId);

    return {
      shop: {
        name: shop.name,
        id: shop.id,
        owner: 'Owner',
      },
      rawOrders: await this.getOrders(ownerId, resolvedShopId),
      statusOptions: orderStatusOptions,
      reminderTemplates,
    };
  }
}
