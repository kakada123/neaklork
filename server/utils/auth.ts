import {
  createError,
  deleteCookie,
  getCookie,
  getHeader,
  readBody,
  setCookie,
  type H3Event,
} from "h3";

const ACCESS_TOKEN_COOKIE = "neaklork_access_token";
const REFRESH_TOKEN_COOKIE = "neaklork_refresh_token";
const ACCESS_TOKEN_MAX_AGE = 15 * 60;
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60;

export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  avatarUrl: string | null;
  role: string;
}

export interface AuthTokenResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

interface ApiErrorBody {
  message?: string | string[];
  error?: string;
}

function isSecureRequest(event: H3Event) {
  return getHeader(event, "x-forwarded-proto") === "https";
}

function getCookieOptions(event: H3Event, maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isSecureRequest(event),
    path: "/",
    maxAge,
  };
}

function getApiBaseUrl(event: H3Event): string {
  return useRuntimeConfig(event).apiBaseUrl.replace(/\/$/, "");
}

function getApiErrorMessage(body?: ApiErrorBody): string {
  if (Array.isArray(body?.message)) {
    return body.message.join(", ");
  }

  return body?.message || body?.error || "Authentication request failed";
}

export async function readAuthBody<TBody>(event: H3Event) {
  return await readBody<TBody>(event);
}

export async function requestApi<TResponse>(
  event: H3Event,
  path: string,
  options: Parameters<typeof $fetch<TResponse>>[1] = {},
): Promise<TResponse> {
  try {
    return (await $fetch(
      `${getApiBaseUrl(event)}${path}`,
      options,
    )) as TResponse;
  } catch (error) {
    const fetchError = error as {
      response?: {
        status?: number;
        _data?: ApiErrorBody;
      };
    };

    throw createError({
      statusCode: fetchError.response?.status ?? 500,
      statusMessage: getApiErrorMessage(fetchError.response?._data),
    });
  }
}

export function getAccessToken(event: H3Event): string | undefined {
  return getCookie(event, ACCESS_TOKEN_COOKIE);
}

export function getRefreshToken(event: H3Event): string | undefined {
  return getCookie(event, REFRESH_TOKEN_COOKIE);
}

export function setAuthCookies(event: H3Event, tokens: AuthTokenResponse) {
  setCookie(
    event,
    ACCESS_TOKEN_COOKIE,
    tokens.accessToken,
    getCookieOptions(event, ACCESS_TOKEN_MAX_AGE),
  );

  setCookie(
    event,
    REFRESH_TOKEN_COOKIE,
    tokens.refreshToken,
    getCookieOptions(event, REFRESH_TOKEN_MAX_AGE),
  );
}

export function clearAuthCookies(event: H3Event) {
  deleteCookie(event, ACCESS_TOKEN_COOKIE, { path: "/" });
  deleteCookie(event, REFRESH_TOKEN_COOKIE, { path: "/" });
}

export async function refreshAuthCookies(event: H3Event) {
  const refreshToken = getRefreshToken(event);

  if (!refreshToken) {
    return null;
  }

  const tokens = await requestApi<AuthTokenResponse>(event, "/auth/refresh", {
    method: "POST",
    body: { refreshToken },
  });

  setAuthCookies(event, tokens);

  return tokens;
}
