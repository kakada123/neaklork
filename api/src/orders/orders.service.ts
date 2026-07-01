import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { ShopsService } from '../shops/shops.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import {
  RawOrder,
  toDbOrderStatus,
  toDbPaymentStatus,
  toRawOrder,
} from './orders.types';

const ORDER_NO_PREFIX = 'NL';

function createOrderNo() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const suffix = randomBytes(2).toString('hex').toUpperCase();

  return `${ORDER_NO_PREFIX}${timestamp}${suffix}`;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shopsService: ShopsService,
  ) {}

  async list(
    ownerId: string,
    filters: ListOrdersQueryDto = {},
  ): Promise<RawOrder[]> {
    const resolvedShopId = await this.shopsService.resolveOwnedShopId(
      ownerId,
      filters.shopId,
    );
    const where: Prisma.OrderWhereInput = { shopId: resolvedShopId };
    const search = filters.search?.trim();

    if (filters.status) {
      where.status = toDbOrderStatus(filters.status);
    }

    if (filters.paymentStatus) {
      where.paymentStatus = toDbPaymentStatus(filters.paymentStatus);
    }

    if (search) {
      where.OR = [
        { orderNo: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
        { productSummary: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orders = await this.prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(toRawOrder);
  }

  async create(
    ownerId: string,
    dto: CreateOrderDto,
    shopId?: string,
  ): Promise<RawOrder> {
    const resolvedShopId = await this.shopsService.resolveOwnedShopId(
      ownerId,
      shopId,
    );

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const order = await this.prisma.order.create({
          data: {
            orderNo: createOrderNo(),
            customerName: dto.customerName,
            customerPhone: dto.customerPhone,
            productSummary: dto.productSummary,
            amountValue: dto.amountValue,
            status: dto.status ? toDbOrderStatus(dto.status) : undefined,
            paymentStatus: dto.paymentStatus
              ? toDbPaymentStatus(dto.paymentStatus)
              : undefined,
            shopId: resolvedShopId,
          },
        });

        return toRawOrder(order);
      } catch (error) {
        if (!this.isOrderNoConflict(error)) {
          throw error;
        }
      }
    }

    throw new ConflictException('Could not create a unique order number');
  }

  async updateStatus(
    ownerId: string,
    id: string,
    dto: UpdateOrderStatusDto,
  ): Promise<RawOrder> {
    if (!dto.status && !dto.paymentStatus) {
      throw new BadRequestException('Order status update is required');
    }

    const existingOrder = await this.prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNo: id }],
        shop: {
          ownerId,
        },
      },
      select: { id: true },
    });

    if (!existingOrder) {
      throw new NotFoundException('Order not found');
    }

    const order = await this.prisma.order.update({
      where: { id: existingOrder.id },
      data: {
        status: dto.status ? toDbOrderStatus(dto.status) : undefined,
        paymentStatus: dto.paymentStatus
          ? toDbPaymentStatus(dto.paymentStatus)
          : undefined,
      },
    });

    return toRawOrder(order);
  }

  private isOrderNoConflict(error: unknown): boolean {
    const target =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? error.meta?.target
        : null;

    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002' &&
      Array.isArray(target) &&
      target.includes('orderNo')
    );
  }
}
