import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { orderStatusValues, paymentStatusValues } from '../orders.types';
import type { OrderStatus, PaymentStatus } from '../orders.types';

export class ListOrdersQueryDto {
  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsIn(orderStatusValues)
  status?: OrderStatus;

  @IsOptional()
  @IsIn(paymentStatusValues)
  paymentStatus?: PaymentStatus;

  @Transform(({ value }: { value: string }) => value?.trim())
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
