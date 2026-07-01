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
  const { shopId, status, paymentStatus, search } = getQuery(event);

  if (!accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required",
    });
  }

  try {
    const query = new URLSearchParams();

    if (typeof shopId === "string" && shopId.length > 0) {
      query.set("shopId", shopId);
    }

    if (typeof status === "string" && status.length > 0) {
      query.set("status", status);
    }

    if (typeof paymentStatus === "string" && paymentStatus.length > 0) {
      query.set("paymentStatus", paymentStatus);
    }

    if (typeof search === "string" && search.trim().length > 0) {
      query.set("search", search.trim());
    }

    const queryString = query.size > 0 ? `?${query.toString()}` : "";

    return await requestApi<OrderItem[]>(event, `/orders${queryString}`, {
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
