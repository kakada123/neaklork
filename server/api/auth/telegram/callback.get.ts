import {
  clearAuthCookies,
  type AuthTokenResponse,
  requestApi,
  setAuthCookies,
} from "../../../utils/auth";
import {
  createError,
  deleteCookie,
  getCookie,
  getHeader,
  getQuery,
  sendRedirect,
  type H3Event,
} from "h3";

const STATE_COOKIE = "neaklork_telegram_oidc_state";
const VERIFIER_COOKIE = "neaklork_telegram_oidc_verifier";

function getRequestOrigin(event: H3Event) {
  const protoHeader = getHeader(event, "x-forwarded-proto");
  const hostHeader =
    getHeader(event, "x-forwarded-host") ?? getHeader(event, "host");

  if (!hostHeader) {
    throw createError({ statusCode: 400, statusMessage: "Missing host header" });
  }

  const proto = protoHeader?.split(",")[0]?.trim() || "http";
  const host = hostHeader.split(",")[0].trim();

  return `${proto}://${host}`;
}

function clearFlowCookies(event: H3Event) {
  deleteCookie(event, STATE_COOKIE, { path: "/" });
  deleteCookie(event, VERIFIER_COOKIE, { path: "/" });
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const code = typeof query.code === "string" ? query.code : "";
  const state = typeof query.state === "string" ? query.state : "";
  const error = typeof query.error === "string" ? query.error : "";
  const expectedState = getCookie(event, STATE_COOKIE);
  const codeVerifier = getCookie(event, VERIFIER_COOKIE);
  const origin = getRequestOrigin(event);
  const redirectUri = `${origin}/api/auth/telegram/callback`;

  if (error) {
    clearFlowCookies(event);
    clearAuthCookies(event);
    return await sendRedirect(event, "/login?telegram=cancelled", 302);
  }

  if (!code || !state || !expectedState || state !== expectedState || !codeVerifier) {
    clearFlowCookies(event);
    clearAuthCookies(event);
    return await sendRedirect(event, "/login?telegram=failed", 302);
  }

  try {
    const auth = await requestApi<AuthTokenResponse>(event, "/auth/telegram/code", {
      method: "POST",
      body: {
        code,
        codeVerifier,
        redirectUri,
      },
    });

    setAuthCookies(event, auth);
    clearFlowCookies(event);

    return await sendRedirect(event, "/", 302);
  } catch {
    clearFlowCookies(event);
    clearAuthCookies(event);
    return await sendRedirect(event, "/login?telegram=failed", 302);
  }
});