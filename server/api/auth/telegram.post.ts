import {
  type AuthTokenResponse,
  readAuthBody,
  requestApi,
  setAuthCookies,
} from "../../utils/auth";

interface TelegramAuthBody {
  idToken: string;
}

export default defineEventHandler(async (event) => {
  const body = await readAuthBody<TelegramAuthBody>(event);
  const auth = await requestApi<AuthTokenResponse>(event, "/auth/telegram", {
    method: "POST",
    body,
  });

  setAuthCookies(event, auth);

  return { user: auth.user };
});
