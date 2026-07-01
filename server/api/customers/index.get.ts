import { createError, getQuery } from "h3";
import { getAccessToken, requestApi } from "../../utils/auth";

interface CustomerItem {
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
}

export default defineEventHandler(async (event): Promise<CustomerItem[]> => {
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

    return await requestApi<CustomerItem[]>(event, `/customers${query}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode ?? 500;

    throw createError({
      statusCode,
      statusMessage: "Failed to load customers",
    });
  }
});
