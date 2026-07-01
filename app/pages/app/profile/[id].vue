<script setup lang="ts">
definePageMeta({
  layout: "mobile",
  showBottomNav: true,
});

const route = useRoute();
const { user } = useAuth();
const { shop } = useNeaklorkMock();

const routeProfileId = computed(() => String(route.params.id || ""));
const resolvedProfileId = computed(() => {
  if (routeProfileId.value === "me") {
    return user.value?.id || "";
  }

  return routeProfileId.value;
});

const isCurrentUser = computed(() => {
  if (!user.value?.id || !resolvedProfileId.value) {
    return false;
  }

  return user.value.id === resolvedProfileId.value;
});

const displayName = computed(() => user.value?.name || shop.name);
const displayEmail = computed(() => user.value?.email || shop.owner);
const displayPhone = computed(() => user.value?.phone || "Not set");
const displayRole = computed(() => user.value?.role || "OWNER");
const displayId = computed(() => resolvedProfileId.value || "Unknown");
const displayAvatarUrl = computed(() => user.value?.avatarUrl || "");
const profileMismatch = computed(
  () => routeProfileId.value !== "me" && !isCurrentUser.value,
);
</script>

<template>
  <div class="flex w-full flex-col gap-[14px]">
    <PageHeader title="Profile" back />

    <section
      class="flex min-h-[90px] items-center gap-[14px] rounded-[26px] border border-white/90 bg-[var(--surface)] p-[16px] shadow-[var(--card-shadow)] backdrop-blur-[20px]"
    >
      <AvatarBubble :name="displayName" :src="displayAvatarUrl" size="md" />

      <div class="min-w-0 flex-1">
        <h2
          class="m-0 truncate text-[20px] font-extrabold leading-none tracking-[-0.45px] text-[var(--text)]"
        >
          {{ displayName }}
        </h2>

        <p
          class="m-0 mt-[8px] truncate text-[13px] font-medium leading-none tracking-[-0.2px] text-[var(--muted)]"
        >
          {{ displayEmail }}
        </p>
      </div>
    </section>

    <p
      v-if="profileMismatch"
      class="m-0 rounded-[18px] bg-[#fff7ea] px-[14px] py-[10px] text-[12px] font-bold leading-snug text-[#995700]"
    >
      This profile route does not match your current user. Showing your active
      account details.
    </p>

    <section
      class="overflow-hidden rounded-[26px] border border-white/90 bg-[var(--surface)] px-[17px] shadow-[var(--card-shadow)] backdrop-blur-[20px]"
      aria-label="Profile details"
    >
      <div class="flex min-h-[52px] items-center justify-between gap-[16px]">
        <span class="text-[13px] font-semibold leading-none text-[var(--muted)]"
          >User ID</span
        >
        <span
          class="max-w-[62%] truncate text-right text-[13px] font-bold leading-none tracking-[-0.2px] text-[var(--text)]"
        >
          {{ displayId }}
        </span>
      </div>

      <div
        class="flex min-h-[52px] items-center justify-between gap-[16px] border-t border-[var(--line)]"
      >
        <span class="text-[13px] font-semibold leading-none text-[var(--muted)]"
          >Role</span
        >
        <span
          class="text-[13px] font-bold uppercase leading-none tracking-[0.06em] text-[var(--text)]"
        >
          {{ displayRole }}
        </span>
      </div>

      <div
        class="flex min-h-[52px] items-center justify-between gap-[16px] border-t border-[var(--line)]"
      >
        <span class="text-[13px] font-semibold leading-none text-[var(--muted)]"
          >Email</span
        >
        <span
          class="max-w-[62%] truncate text-right text-[13px] font-bold leading-none tracking-[-0.2px] text-[var(--text)]"
        >
          {{ displayEmail }}
        </span>
      </div>

      <div
        class="flex min-h-[52px] items-center justify-between gap-[16px] border-t border-[var(--line)]"
      >
        <span class="text-[13px] font-semibold leading-none text-[var(--muted)]"
          >Phone</span
        >
        <span
          class="max-w-[62%] truncate text-right text-[13px] font-bold leading-none tracking-[-0.2px] text-[var(--text)]"
        >
          {{ displayPhone }}
        </span>
      </div>
    </section>
  </div>
</template>
