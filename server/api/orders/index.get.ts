import { createError, getQuery } from "h3";
import { getAccessToken, requestApi } from "../../utils/auth";

interface OrderItem {
  id: string;
  customerName: string;
  customerPhone: string;
  productSummary: string;
  amountValue: number;
  minutesAgo: number;
  status: "new" | "confirmed" | "packing" | "delivering" | "paid" | "problem";
  statusLabel: string;
  paymentStatus: "unpaid" | "paid" | "partial" | "paypal";
  paymentLabel: string;
}

export default defineEventHandler(async (event): Promise<OrderItem[]> => {
  const accessToken = getAccessToken(event);
  const shopId = getQuery(event).shopId;

  if (!accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required",
    });
  }

  try {
    const query =
      typeof shopId === "string" && shopId.length > 0
        ? `?shopId=${encodeURIComponent(shopId)}`
        : "";

    return await requestApi<OrderItem[]>(event, `/orders${query}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode ?? 500;

    throw createError({
      statusCode,
      statusMessage: "Failed to load orders",
    });
  }
});
