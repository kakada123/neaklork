import { createError, getQuery } from "h3";
import { getAccessToken, requestApi } from "../../utils/auth";

interface AppSeedData {
  shop: {
    name: string;
    id: string;
    owner: string;
  };
  rawOrders: Array<{
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
  }>;
  statusOptions: Array<{
    key: "new" | "confirmed" | "packing" | "delivering" | "paid" | "problem";
    label: string;
    icon: string;
  }>;
  reminderTemplates: Array<{
    title: string;
    message: string;
  }>;
}

export default defineEventHandler(async (event): Promise<AppSeedData> => {
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

    return await requestApi<AppSeedData>(event, `/app/data${query}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode ?? 500;

    throw createError({
      statusCode,
      statusMessage: "Failed to load app data",
    });
  }
});
