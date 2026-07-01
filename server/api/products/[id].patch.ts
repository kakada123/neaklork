import { createError, getQuery, getRouterParam, readBody } from "h3";
import { getAccessToken, requestApi } from "../../utils/auth";

interface ProductUpdateBody {
  name?: string;
  sku?: string;
  description?: string;
  price?: number;
  isActive?: boolean;
}

interface ProductItem {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default defineEventHandler(async (event): Promise<ProductItem> => {
  const accessToken = getAccessToken(event);
  const shopId = getQuery(event).shopId;
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
      statusMessage: "Product id is required",
    });
  }

  try {
    const body = await readBody<ProductUpdateBody>(event);
    const query =
      typeof shopId === "string" && shopId.length > 0
        ? `?shopId=${encodeURIComponent(shopId)}`
        : "";

    return await requestApi<ProductItem>(event, `/products/${id}${query}`, {
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
      statusMessage: "Failed to update product",
    });
  }
});
