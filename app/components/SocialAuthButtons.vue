<script setup lang="ts">
interface GoogleCredentialResponse {
  credential?: string;
}

interface TelegramLoginResponse {
  id_token?: string;
  error?: string;
}

interface FacebookLoginResponse {
  authResponse?: {
    accessToken?: string;
  };
}

interface FacebookSdk {
  init(options: {
    appId: string;
    cookie: boolean;
    xfbml: boolean;
    version: string;
  }): void;
  login(
    callback: (response: FacebookLoginResponse) => void,
    options: { scope: string },
  ): void;
}

declare global {
  interface Window {
    FB?: FacebookSdk;
    google?: {
      accounts: {
        id: {
          initialize(options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }): void;
          renderButton(
            parent: HTMLElement,
            options: {
              theme: string;
              size: string;
              text: string;
              shape: string;
              width: number;
            },
          ): void;
        };
      };
    };
    onNeaklorkTelegramAuth?: (payload: TelegramLoginResponse) => void;
  }
}

const emit = defineEmits<{
  success: [];
  error: [message: string];
}>();

const config = useRuntimeConfig();
const { loginWithGoogle, loginWithFacebook, loginWithTelegram } = useAuth();

const googleButtonRef = ref<HTMLElement | null>(null);
const telegramWidgetRef = ref<HTMLElement | null>(null);
const activeProvider = ref<"google" | "facebook" | "telegram" | null>(null);
const setupError = ref("");

const googleClientId = computed(() => config.public.googleClientId);
const facebookAppId = computed(() => config.public.facebookAppId);
const telegramClientId = computed(() => config.public.telegramClientId);

const hasGoogle = computed(() => Boolean(googleClientId.value));
const hasFacebook = computed(() => Boolean(facebookAppId.value));
const hasTelegram = computed(() => Boolean(telegramClientId.value));

function loadScript(id: string, src: string) {
  return new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(
      id,
    ) as HTMLScriptElement | null;

    if (existingScript) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));

    document.head.appendChild(script);
  });
}

async function runSocialAuth(
  provider: "google" | "facebook" | "telegram",
  action: () => Promise<unknown>,
) {
  setupError.value = "";
  activeProvider.value = provider;

  try {
    await action();
    emit("success");
  } catch (error) {
    emit("error", getAuthErrorMessage(error));
  } finally {
    activeProvider.value = null;
  }
}

async function setupGoogleButton() {
  if (!hasGoogle.value || !googleButtonRef.value) {
    return;
  }

  try {
    await loadScript(
      "google-identity-services",
      "https://accounts.google.com/gsi/client",
    );

    if (!window.google) {
      throw new Error("Google Identity Services is not available");
    }

    googleButtonRef.value.innerHTML = "";
    window.google.accounts.id.initialize({
      client_id: googleClientId.value,
      callback: (response) => {
        if (!response.credential) {
          emit("error", "Google did not return an ID token");
          return;
        }

        void runSocialAuth("google", () =>
          loginWithGoogle(response.credential!),
        );
      },
    });

    window.google.accounts.id.renderButton(googleButtonRef.value, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "pill",
      width: googleButtonRef.value.clientWidth || 320,
    });
  } catch {
    setupError.value = "Google login is not available right now.";
  }
}

async function setupFacebookSdk() {
  if (!hasFacebook.value) {
    throw new Error("Facebook login is not configured");
  }

  await loadScript(
    "facebook-jssdk",
    "https://connect.facebook.net/en_US/sdk.js",
  );

  if (!window.FB) {
    throw new Error("Facebook SDK is not available");
  }

  window.FB.init({
    appId: facebookAppId.value,
    cookie: false,
    xfbml: false,
    version: "v21.0",
  });
}

async function handleFacebookLogin() {
  await runSocialAuth("facebook", async () => {
    await setupFacebookSdk();

    const accessToken = await new Promise<string>((resolve, reject) => {
      window.FB?.login(
        (response) => {
          const token = response.authResponse?.accessToken;

          if (!token) {
            reject(new Error("Facebook login was cancelled"));
            return;
          }

          resolve(token);
        },
        { scope: "email,public_profile" },
      );
    });

    await loginWithFacebook(accessToken);
  });
}

function setupTelegramWidget() {
  if (!hasTelegram.value || !telegramWidgetRef.value) {
    return;
  }

  window.onNeaklorkTelegramAuth = (payload) => {
    if (payload.error) {
      emit("error", payload.error);
      return;
    }

    if (!payload.id_token) {
      emit("error", "Telegram did not return an ID token");
      return;
    }

    void runSocialAuth("telegram", () => loginWithTelegram(payload.id_token!));
  };

  telegramWidgetRef.value.innerHTML = "";

  const script = document.createElement("script");
  script.src = "https://oauth.telegram.org/js/telegram-login.js?5";
  script.async = true;
  script.setAttribute("data-client-id", telegramClientId.value);
  script.setAttribute("data-request-access", "write");
  script.setAttribute("data-onauth", "onNeaklorkTelegramAuth(data)");

  telegramWidgetRef.value.appendChild(script);
}

onMounted(() => {
  void setupGoogleButton();
  setupTelegramWidget();
});

onBeforeUnmount(() => {
  delete window.onNeaklorkTelegramAuth;
});
</script>

<template>
  <div class="mt-[18px] flex flex-col gap-[12px]">
    <div class="flex items-center gap-[12px]">
      <span class="h-px flex-1 bg-[var(--line)]" />
      <span
        class="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--muted)]"
      >
        Or continue with
      </span>
      <span class="h-px flex-1 bg-[var(--line)]" />
    </div>

    <div class="grid gap-[10px]">
      <div
        v-if="hasGoogle"
        ref="googleButtonRef"
        class="grid min-h-[44px] place-items-center overflow-hidden rounded-[20px]"
      />

      <button
        v-else
        class="flex h-[46px] w-full items-center justify-center gap-[10px] rounded-[20px] border border-[var(--line)] bg-white/70 text-[14px] font-black tracking-[-0.2px] text-[var(--muted)] opacity-60"
        type="button"
        disabled
      >
        <span class="text-[16px] font-black">G</span>
        Google not configured
      </button>

      <button
        class="flex h-[46px] w-full items-center justify-center gap-[10px] rounded-[20px] border border-[#1877f2]/20 bg-white/80 text-[14px] font-black tracking-[-0.2px] text-[#1877f2] shadow-[0_8px_18px_rgba(24,119,242,0.08)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        :disabled="!hasFacebook || activeProvider !== null"
        @click="handleFacebookLogin"
      >
        <i class="pi pi-facebook text-[18px]" aria-hidden="true" />
        {{
          activeProvider === "facebook"
            ? "Connecting..."
            : hasFacebook
              ? "Continue with Facebook"
              : "Facebook not configured"
        }}
      </button>

      <div
        v-if="hasTelegram"
        class="grid min-h-[46px] place-items-center rounded-[20px] border border-[#229ed9]/15 bg-white/80 py-[6px] shadow-[0_8px_18px_rgba(34,158,217,0.08)]"
      >
        <div ref="telegramWidgetRef" />
      </div>

      <button
        v-else
        class="flex h-[46px] w-full items-center justify-center gap-[10px] rounded-[20px] border border-[var(--line)] bg-white/70 text-[14px] font-black tracking-[-0.2px] text-[var(--muted)] opacity-60"
        type="button"
        disabled
      >
        <i class="pi pi-telegram text-[18px]" aria-hidden="true" />
        Telegram not configured
      </button>
    </div>

    <p
      v-if="setupError"
      class="m-0 rounded-[18px] bg-[#fff0f3] px-[14px] py-[10px] text-[12px] font-bold leading-snug text-[var(--red)]"
    >
      {{ setupError }}
    </p>
  </div>
</template>
