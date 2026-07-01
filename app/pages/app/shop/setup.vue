<script setup lang="ts">
definePageMeta({
  layout: "mobile",
  showBottomNav: false,
});

useHead({
  title: "Shop Setup | NeakLork",
});

const route = useRoute();
const { user } = useAuth();
const { createShop } = useShopFlow();

const form = reactive({
  name: "",
  description: "",
});
const isSubmitting = ref(false);
const errorMessage = ref("");

const canSubmit = computed(() => form.name.trim().length >= 2);

function getRedirectTarget() {
  const redirect = route.query.redirect;

  if (typeof redirect !== "string" || !redirect.startsWith("/")) {
    return "/";
  }

  if (
    redirect === "/login" ||
    redirect === "/signup" ||
    redirect === "/shop/setup"
  ) {
    return "/";
  }

  return redirect;
}

async function handleSubmit() {
  if (!user.value || !canSubmit.value || isSubmitting.value) {
    return;
  }

  errorMessage.value = "";
  isSubmitting.value = true;

  try {
    await createShop(
      {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      },
      user.value.id,
    );
    await navigateTo(getRedirectTarget());
  } catch (error) {
    errorMessage.value = getAuthErrorMessage(error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-[calc(100dvh-166px)] w-full flex-col justify-center">
    <section
      class="relative overflow-hidden rounded-[34px] border border-white/90 bg-[var(--surface)] px-[22px] py-[26px] shadow-[var(--card-shadow)] backdrop-blur-[20px]"
    >
      <div
        class="pointer-events-none absolute -left-12 -top-10 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(34,199,216,0.14),transparent_68%)]"
      />

      <div
        class="pointer-events-none absolute -bottom-16 -right-12 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(112,72,255,0.14),transparent_68%)]"
      />

      <div class="relative">
        <div class="flex items-center gap-[10px]">
          <AppIcon name="app_logo_bag" :size="38" />

          <div>
            <p
              class="m-0 text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]"
            >
              Shop setup
            </p>

            <h1
              class="m-0 mt-[5px] text-[30px] font-black leading-none tracking-[-1px] text-[var(--purple)]"
            >
              Create Shop
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
              Shop name
            </span>

            <input
              v-model.trim="form.name"
              class="h-[52px] w-full rounded-[20px] border border-[var(--line)] bg-white/80 px-[16px] text-[15px] font-semibold tracking-[-0.2px] text-[var(--text)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--purple)] focus:ring-4 focus:ring-[#4b25e8]/10"
              type="text"
              autocomplete="organization"
              placeholder="Sokun Shop"
              minlength="2"
              maxlength="120"
              required
            />
          </label>

          <label class="block">
            <span
              class="mb-[8px] block px-1 text-[13px] font-bold leading-none text-[var(--text)]"
            >
              Description
            </span>

            <textarea
              v-model.trim="form.description"
              class="min-h-[92px] w-full resize-none rounded-[20px] border border-[var(--line)] bg-white/80 px-[16px] py-[14px] text-[15px] font-semibold tracking-[-0.2px] text-[var(--text)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--purple)] focus:ring-4 focus:ring-[#4b25e8]/10"
              autocomplete="off"
              placeholder="Online clothing, cosmetics, or daily goods"
              maxlength="500"
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
            :disabled="!canSubmit || isSubmitting"
          >
            {{ isSubmitting ? "Creating shop..." : "Continue" }}
          </button>
        </form>
      </div>
    </section>
  </div>
</template>
