import { IsIn, IsOptional } from 'class-validator';
import { orderStatusValues, paymentStatusValues } from '../orders.types';
import type { OrderStatus, PaymentStatus } from '../orders.types';

export class UpdateOrderStatusDto {
  @IsOptional()
  @IsIn(orderStatusValues)
  status?: OrderStatus;

  @IsOptional()
  @IsIn(paymentStatusValues)
  paymentStatus?: PaymentStatus;
}
