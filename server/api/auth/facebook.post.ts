import {
  type AuthTokenResponse,
  readAuthBody,
  requestApi,
  setAuthCookies,
} from "../../utils/auth";

interface FacebookAuthBody {
  accessToken: string;
}

export default defineEventHandler(async (event) => {
  const body = await readAuthBody<FacebookAuthBody>(event);
  const auth = await requestApi<AuthTokenResponse>(event, "/auth/facebook", {
    method: "POST",
    body,
  });

  setAuthCookies(event, auth);

  return { user: auth.user };
});
