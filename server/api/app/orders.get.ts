import { createError, getQuery } from "h3";
import { getAccessToken, requestApi } from "../../utils/auth";

type PaymentStatus = "unpaid" | "paid" | "partial" | "paypal";
type OrderStatus =
  | "new"
  | "confirmed"
  | "packing"
  | "delivering"
  | "paid"
  | "problem";

interface RawOrder {
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

export default defineEventHandler(async (event): Promise<RawOrder[]> => {
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

    return await requestApi<RawOrder[]>(event, `/orders${query}`, {
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
