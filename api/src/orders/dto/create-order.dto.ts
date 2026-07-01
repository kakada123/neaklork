import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { orderStatusValues, paymentStatusValues } from '../orders.types';
import type { OrderStatus, PaymentStatus } from '../orders.types';

export class CreateOrderDto {
  @Transform(({ value }: { value: string }) => value?.trim())
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  customerName!: string;

  @Transform(({ value }: { value: string }) => value?.trim())
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  customerPhone!: string;

  @Transform(({ value }: { value: string }) => value?.trim())
  @IsString()
  @MinLength(1)
  @MaxLength(240)
  productSummary!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amountValue!: number;

  @IsOptional()
  @IsIn(orderStatusValues)
  status?: OrderStatus;

  @IsOptional()
  @IsIn(paymentStatusValues)
  paymentStatus?: PaymentStatus;
}
