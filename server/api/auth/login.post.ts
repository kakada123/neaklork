import {
  type AuthTokenResponse,
  readAuthBody,
  requestApi,
  setAuthCookies,
} from "../../utils/auth";

interface LoginBody {
  email: string;
  password: string;
}

export default defineEventHandler(async (event) => {
  const body = await readAuthBody<LoginBody>(event);
  const auth = await requestApi<AuthTokenResponse>(event, "/auth/login", {
    method: "POST",
    body,
  });

  setAuthCookies(event, auth);

  return { user: auth.user };
});
