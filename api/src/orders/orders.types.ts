import {
  Order as DbOrder,
  OrderStatus as DbOrderStatus,
  PaymentStatus as DbPaymentStatus,
} from '@prisma/client';

export type PaymentStatus = 'unpaid' | 'paid' | 'partial' | 'paypal';
export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'packing'
  | 'delivering'
  | 'paid'
  | 'problem';

export const orderStatusValues: OrderStatus[] = [
  'new',
  'confirmed',
  'packing',
  'delivering',
  'paid',
  'problem',
];

export const paymentStatusValues: PaymentStatus[] = [
  'unpaid',
  'paid',
  'partial',
  'paypal',
];

export interface RawOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  productSummary: string;
  amountValue: number;
  minutesAgo: number;
  status: OrderStatus;
  statusLabel: string;
  paymentStatus: PaymentStatus;
  paymentLabel: string;
}

export const statusOptions: Array<{
  key: OrderStatus;
  label: string;
  icon: string;
}> = [
  { key: 'new', label: 'New', icon: 'status_new' },
  { key: 'confirmed', label: 'Confirmed', icon: 'status_confirmed' },
  { key: 'packing', label: 'Packing', icon: 'status_packing' },
  { key: 'delivering', label: 'Delivering', icon: 'status_delivering' },
  { key: 'paid', label: 'Paid', icon: 'status_paid' },
  { key: 'problem', label: 'Problem', icon: 'status_problem' },
];

const dbToApiOrderStatus: Record<DbOrderStatus, OrderStatus> = {
  NEW: 'new',
  CONFIRMED: 'confirmed',
  PACKING: 'packing',
  DELIVERING: 'delivering',
  PAID: 'paid',
  PROBLEM: 'problem',
};

const apiToDbOrderStatus: Record<OrderStatus, DbOrderStatus> = {
  new: DbOrderStatus.NEW,
  confirmed: DbOrderStatus.CONFIRMED,
  packing: DbOrderStatus.PACKING,
  delivering: DbOrderStatus.DELIVERING,
  paid: DbOrderStatus.PAID,
  problem: DbOrderStatus.PROBLEM,
};

const orderStatusLabels: Record<OrderStatus, string> = {
  new: 'New',
  confirmed: 'Confirmed',
  packing: 'Packing',
  delivering: 'Delivering',
  paid: 'Paid',
  problem: 'Problem',
};

const dbToApiPaymentStatus: Record<DbPaymentStatus, PaymentStatus> = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  PARTIAL: 'partial',
  PAYPAL: 'paypal',
};

const apiToDbPaymentStatus: Record<PaymentStatus, DbPaymentStatus> = {
  unpaid: DbPaymentStatus.UNPAID,
  paid: DbPaymentStatus.PAID,
  partial: DbPaymentStatus.PARTIAL,
  paypal: DbPaymentStatus.PAYPAL,
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  unpaid: 'Unpaid',
  paid: 'Paid',
  partial: 'Partial',
  paypal: 'Paypal',
};

export function toRawOrder(order: DbOrder): RawOrder {
  const status = dbToApiOrderStatus[order.status];
  const paymentStatus = dbToApiPaymentStatus[order.paymentStatus];
  const minutesAgo = Math.max(
    1,
    Math.floor((Date.now() - order.createdAt.getTime()) / (1000 * 60)),
  );

  return {
    id: order.orderNo,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    productSummary: order.productSummary,
    amountValue: order.amountValue.toNumber(),
    minutesAgo,
    status,
    statusLabel: orderStatusLabels[status],
    paymentStatus,
    paymentLabel: paymentStatusLabels[paymentStatus],
  };
}

export function toDbOrderStatus(status: OrderStatus): DbOrderStatus {
  return apiToDbOrderStatus[status];
}

export function toDbPaymentStatus(status: PaymentStatus): DbPaymentStatus {
  return apiToDbPaymentStatus[status];
}
