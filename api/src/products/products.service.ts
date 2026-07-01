import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ShopsService } from '../shops/shops.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

export interface ProductBasicInfo {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function toProductBasicInfo(product: {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  price: Prisma.Decimal;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): ProductBasicInfo {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    description: product.description,
    price: product.price.toNumber(),
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shopsService: ShopsService,
  ) {}

  async create(
    ownerId: string,
    dto: CreateProductDto,
    shopId?: string,
  ): Promise<ProductBasicInfo> {
    const resolvedShopId = await this.shopsService.resolveOwnedShopId(
      ownerId,
      shopId,
    );

    try {
      const product = await this.prisma.product.create({
        data: {
          name: dto.name,
          sku: dto.sku,
          description: dto.description,
          price: dto.price,
          isActive: dto.isActive,
          shopId: resolvedShopId,
        },
      });

      return toProductBasicInfo(product);
    } catch (error) {
      this.throwConflictOnUnique(error);
      throw error;
    }
  }

  async list(ownerId: string, shopId?: string): Promise<ProductBasicInfo[]> {
    const resolvedShopId = await this.shopsService.resolveOwnedShopId(
      ownerId,
      shopId,
    );

    const products = await this.prisma.product.findMany({
      where: { shopId: resolvedShopId },
      orderBy: { createdAt: 'desc' },
    });

    return products.map(toProductBasicInfo);
  }

  async findById(ownerId: string, id: string): Promise<ProductBasicInfo> {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        shop: {
          ownerId,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return toProductBasicInfo(product);
  }

  async update(
    ownerId: string,
    id: string,
    dto: UpdateProductDto,
  ): Promise<ProductBasicInfo> {
    await this.findById(ownerId, id);

    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: {
          name: dto.name,
          sku: dto.sku,
          description: dto.description,
          price: dto.price,
          isActive: dto.isActive,
        },
      });

      return toProductBasicInfo(product);
    } catch (error) {
      this.throwConflictOnUnique(error);
      throw error;
    }
  }

  async remove(ownerId: string, id: string): Promise<ProductBasicInfo> {
    await this.findById(ownerId, id);

    const deletedProduct = await this.prisma.product.delete({ where: { id } });
    return toProductBasicInfo(deletedProduct);
  }

  private throwConflictOnUnique(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Product sku already exists');
    }
  }
}
