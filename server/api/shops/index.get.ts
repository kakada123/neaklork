import { createError } from "h3";
import { getAccessToken, requestApi } from "../../utils/auth";

interface ShopItem {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default defineEventHandler(async (event): Promise<ShopItem[]> => {
  const accessToken = getAccessToken(event);

  if (!accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required",
    });
  }

  try {
    return await requestApi<ShopItem[]>(event, "/shops", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode ?? 500;

    throw createError({
      statusCode,
      statusMessage: "Failed to load shops",
    });
  }
});
