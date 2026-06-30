import {
  type AuthTokenResponse,
  readAuthBody,
  requestApi,
  setAuthCookies,
} from "../../utils/auth";

interface SignupBody {
  email: string;
  password: string;
  name?: string;
}

export default defineEventHandler(async (event) => {
  const body = await readAuthBody<SignupBody>(event);
  const auth = await requestApi<AuthTokenResponse>(event, "/auth/signup", {
    method: "POST",
    body,
  });

  setAuthCookies(event, auth);

  return { user: auth.user };
});
