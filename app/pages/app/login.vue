<script setup lang="ts">
definePageMeta({
  layout: "mobile",
  showBottomNav: false,
});

useHead({
  title: "Login | NeakLork",
});

const route = useRoute();
const { login } = useAuth();

const form = reactive({
  email: "",
  password: "",
});
const isSubmitting = ref(false);
const errorMessage = ref("");

function getRedirectTarget() {
  const redirect = route.query.redirect;

  if (typeof redirect !== "string" || !redirect.startsWith("/")) {
    return "/";
  }

  if (redirect === "/login" || redirect === "/signup") {
    return "/";
  }

  return redirect;
}

async function handleSubmit() {
  errorMessage.value = "";
  isSubmitting.value = true;

  try {
    await login({
      email: form.email,
      password: form.password,
    });
    await navigateTo(getRedirectTarget());
  } catch (error) {
    errorMessage.value = getAuthErrorMessage(error);
  } finally {
    isSubmitting.value = false;
  }
}

async function handleSocialSuccess() {
  await navigateTo(getRedirectTarget());
}
</script>

<template>
  <div class="flex min-h-[calc(100dvh-166px)] w-full flex-col justify-center">
    <section
      class="relative overflow-hidden rounded-[34px] border border-white/90 bg-[var(--surface)] px-[22px] py-[26px] shadow-[var(--card-shadow)] backdrop-blur-[20px]"
    >
      <div
        class="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(112,72,255,0.16),transparent_68%)]"
      />

      <div class="relative">
        <div class="flex items-center gap-[10px]">
          <AppIcon name="app_logo_bag" :size="38" />

          <div>
            <p
              class="m-0 text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]"
            >
              Welcome back
            </p>

            <h1
              class="m-0 mt-[5px] text-[30px] font-black leading-none tracking-[-1px] text-[var(--purple)]"
            >
              NeakLork
            </h1>
          </div>
        </div>

        <form
          class="mt-[28px] flex flex-col gap-[14px]"
          @submit.prevent="handleSubmit"
        >
          <label class="block">
            <span
              class="mb-[8px] block px-1 text-[13px] font-bold leading-none text-[var(--text)]"
            >
              Email
            </span>

            <input
              v-model.trim="form.email"
              class="h-[52px] w-full rounded-[20px] border border-[var(--line)] bg-white/80 px-[16px] text-[15px] font-semibold tracking-[-0.2px] text-[var(--text)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--purple)] focus:ring-4 focus:ring-[#4b25e8]/10"
              type="email"
              autocomplete="email"
              inputmode="email"
              placeholder="seller@example.com"
              required
            />
          </label>

          <label class="block">
            <span
              class="mb-[8px] block px-1 text-[13px] font-bold leading-none text-[var(--text)]"
            >
              Password
            </span>

            <input
              v-model="form.password"
              class="h-[52px] w-full rounded-[20px] border border-[var(--line)] bg-white/80 px-[16px] text-[15px] font-semibold tracking-[-0.2px] text-[var(--text)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--purple)] focus:ring-4 focus:ring-[#4b25e8]/10"
              type="password"
              autocomplete="current-password"
              placeholder="At least 8 characters"
              minlength="8"
              required
            />
          </label>

          <p
            v-if="errorMessage"
            class="m-0 rounded-[18px] bg-[#fff0f3] px-[14px] py-[11px] text-[13px] font-bold leading-snug text-[var(--red)]"
          >
            {{ errorMessage }}
          </p>

          <button
            class="mt-[4px] flex h-[54px] w-full items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,#7048ff_0%,#5b31ef_52%,#4f22e8_100%)] text-[15px] font-black tracking-[-0.2px] text-white shadow-[var(--purple-shadow)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-65"
            type="submit"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? "Logging in..." : "Login" }}
          </button>
        </form>

        <SocialAuthButtons
          @success="handleSocialSuccess"
          @error="errorMessage = $event"
        />

        <p
          class="m-0 mt-[18px] text-center text-[13px] font-semibold leading-tight text-[var(--muted)]"
        >
          New to NeakLork?
          <NuxtLink class="font-black text-[var(--purple)]" to="/signup">
            Create account
          </NuxtLink>
        </p>
      </div>
    </section>
  </div>
</template>
