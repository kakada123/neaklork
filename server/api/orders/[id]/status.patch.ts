import { createError, getRouterParam, readBody } from "h3";
import { getAccessToken, requestApi } from "../../../utils/auth";

type PaymentStatus = "unpaid" | "paid" | "partial" | "paypal";
type OrderStatus =
  | "new"
  | "confirmed"
  | "packing"
  | "delivering"
  | "paid"
  | "problem";

interface OrderStatusUpdateBody {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
}

interface OrderItem {
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

export default defineEventHandler(async (event): Promise<OrderItem> => {
  const accessToken = getAccessToken(event);
  const id = getRouterParam(event, "id");

  if (!accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required",
    });
  }

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Order id is required",
    });
  }

  try {
    const body = await readBody<OrderStatusUpdateBody>(event);

    return await requestApi<OrderItem>(event, `/orders/${id}/status`, {
      method: "PATCH",
      body,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode ?? 500;

    throw createError({
      statusCode,
      statusMessage: "Failed to update order status",
    });
  }
});
