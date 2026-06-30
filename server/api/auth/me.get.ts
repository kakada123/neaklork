import { createError, type H3Event } from "h3";
import {
  type AuthUser,
  clearAuthCookies,
  getAccessToken,
  refreshAuthCookies,
  requestApi,
} from "../../utils/auth";

interface MeResponse {
  user: AuthUser;
}

async function requestCurrentUser(
  event: H3Event,
  accessToken = getAccessToken(event),
): Promise<AuthUser> {
  if (!accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required",
    });
  }

  return await requestApi<AuthUser>(event, "/auth/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export default defineEventHandler(async (event): Promise<MeResponse> => {
  try {
    return { user: await requestCurrentUser(event) };
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;

    if (statusCode !== 401) {
      throw error;
    }

    try {
      const auth = await refreshAuthCookies(event);

      if (!auth) {
        throw createError({
          statusCode: 401,
          statusMessage: "Authentication required",
        });
      }

      return { user: await requestCurrentUser(event, auth.accessToken) };
    } catch {
      clearAuthCookies(event);

      throw createError({
        statusCode: 401,
        statusMessage: "Authentication required",
      });
    }
  }
});
