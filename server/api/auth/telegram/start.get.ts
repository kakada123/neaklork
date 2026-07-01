import { createHash, randomBytes } from "node:crypto";
import {
  createError,
  getHeader,
  sendRedirect,
  setCookie,
  type H3Event,
} from "h3";

const STATE_COOKIE = "neaklork_telegram_oidc_state";
const VERIFIER_COOKIE = "neaklork_telegram_oidc_verifier";
const COOKIE_MAX_AGE = 10 * 60;

function toBase64Url(buffer: Buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function getRequestOrigin(event: H3Event) {
  const protoHeader = getHeader(event, "x-forwarded-proto");
  const hostHeader =
    getHeader(event, "x-forwarded-host") ?? getHeader(event, "host");

  if (!hostHeader) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing host header",
    });
  }

  const proto = protoHeader?.split(",")[0]?.trim() || "http";
  const host = hostHeader.split(",")[0].trim();

  return `${proto}://${host}`;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const clientId = config.public.telegramClientId;

  if (!clientId) {
    throw createError({
      statusCode: 500,
      statusMessage: "Telegram client id is not configured",
    });
  }

  const origin = getRequestOrigin(event);
  const redirectUri = `${origin}/api/auth/telegram/callback`;
  const state = toBase64Url(randomBytes(24));
  const codeVerifier = toBase64Url(randomBytes(48));
  const codeChallenge = toBase64Url(
    createHash("sha256").update(codeVerifier).digest(),
  );
  const isSecure = origin.startsWith("https://");

  setCookie(event, STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  setCookie(event, VERIFIER_COOKIE, codeVerifier, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  const authUrl = new URL("https://oauth.telegram.org/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  return await sendRedirect(event, authUrl.toString(), 302);
});
