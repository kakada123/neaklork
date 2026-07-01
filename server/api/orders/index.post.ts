import { createError, getQuery, readBody } from "h3";
import { getAccessToken, requestApi } from "../../utils/auth";

type PaymentStatus = "unpaid" | "paid" | "partial" | "paypal";
type OrderStatus =
  | "new"
  | "confirmed"
  | "packing"
  | "delivering"
  | "paid"
  | "problem";

interface OrderCreateBody {
  customerName: string;
  customerPhone: string;
  productSummary: string;
  amountValue: number;
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
  const shopId = getQuery(event).shopId;

  if (!accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required",
    });
  }

  try {
    const body = await readBody<OrderCreateBody>(event);
    const query =
      typeof shopId === "string" && shopId.length > 0
        ? `?shopId=${encodeURIComponent(shopId)}`
        : "";

    return await requestApi<OrderItem>(event, `/orders${query}`, {
      method: "POST",
      body,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode ?? 500;

    throw createError({
      statusCode,
      statusMessage: "Failed to create order",
    });
  }
});
