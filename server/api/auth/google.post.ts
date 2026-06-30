import {
  type AuthTokenResponse,
  readAuthBody,
  requestApi,
  setAuthCookies,
} from "../../utils/auth";

interface GoogleAuthBody {
  token: string;
}

export default defineEventHandler(async (event) => {
  const body = await readAuthBody<GoogleAuthBody>(event);
  const auth = await requestApi<AuthTokenResponse>(event, "/auth/google", {
    method: "POST",
    body,
  });

  setAuthCookies(event, auth);

  return { user: auth.user };
});
