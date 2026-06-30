import {
  type AuthTokenResponse,
  readAuthBody,
  requestApi,
  setAuthCookies,
} from "../../utils/auth";

interface TelegramAuthBody {
  id: string | number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: string | number;
  hash: string;
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
