export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  avatarUrl: string | null;
  role: string;
}

interface AuthUserResponse {
  user: AuthUser;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface SignupPayload extends LoginPayload {
  name?: string;
}

export interface TelegramAuthPayload {
  idToken: string;
}

export function getAuthErrorMessage(error: unknown) {
  const fetchError = error as {
    data?: {
      message?: string | string[];
      statusMessage?: string;
    };
    statusMessage?: string;
    message?: string;
  };
  const message =
    fetchError.data?.message ??
    fetchError.data?.statusMessage ??
    fetchError.statusMessage ??
    fetchError.message;

  if (Array.isArray(message)) {
    return message.join(", ");
  }

  return message || "Authentication failed. Please try again.";
}

export function useAuth() {
  const user = useState<AuthUser | null>("auth:user", () => null);
  const isReady = useState("auth:is-ready", () => false);

  async function fetchMe() {
    try {
      const headers = import.meta.server ? useRequestHeaders(["cookie"]) : {};
      const response = await $fetch<AuthUserResponse>("/api/auth/me", {
        headers,
      });

      user.value = response.user;
      return response.user;
    } catch {
      user.value = null;
      return null;
    } finally {
      isReady.value = true;
    }
  }

  async function login(payload: LoginPayload) {
    const response = await $fetch<AuthUserResponse>("/api/auth/login", {
      method: "POST",
      body: payload,
    });

    user.value = response.user;
    isReady.value = true;

    return response.user;
  }

  async function signup(payload: SignupPayload) {
    const response = await $fetch<AuthUserResponse>("/api/auth/signup", {
      method: "POST",
      body: payload,
    });

    user.value = response.user;
    isReady.value = true;

    return response.user;
  }

  async function loginWithGoogle(token: string) {
    const response = await $fetch<AuthUserResponse>("/api/auth/google", {
      method: "POST",
      body: { token },
    });

    user.value = response.user;
    isReady.value = true;

    return response.user;
  }

  async function loginWithFacebook(accessToken: string) {
    const response = await $fetch<AuthUserResponse>("/api/auth/facebook", {
      method: "POST",
      body: { accessToken },
    });

    user.value = response.user;
    isReady.value = true;

    return response.user;
  }

  async function loginWithTelegram(idToken: string) {
    const response = await $fetch<AuthUserResponse>("/api/auth/telegram", {
      method: "POST",
      body: { idToken },
    });

    user.value = response.user;
    isReady.value = true;

    return response.user;
  }

  async function startTelegramCodeLogin() {
    if (import.meta.client) {
      window.location.assign("/api/auth/telegram/start");
      return;
    }

    await navigateTo("/api/auth/telegram/start", { external: true });
  }

  async function logout() {
    await $fetch("/api/auth/logout", { method: "POST" }).catch(() => null);

    user.value = null;
    isReady.value = true;
  }

  return {
    user,
    isReady,
    fetchMe,
    login,
    signup,
    loginWithGoogle,
    loginWithFacebook,
    loginWithTelegram,
    startTelegramCodeLogin,
    logout,
  };
}
