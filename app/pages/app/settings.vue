<script setup lang="ts">
definePageMeta({
  layout: "mobile",
  showBottomNav: true,
});

interface MenuItem {
  label: string;
  to: string;
  icon: string;
  match: (path: string) => boolean;
}

const route = useRoute();
const { shop } = useNeaklorkMock();
const { user, logout } = useAuth();
const isLoggingOut = ref(false);
const showLogoutConfirm = ref(false);
const profilePath = computed(() => `/profile/${user.value?.id ?? "me"}`);
const displayAvatarUrl = computed(() => user.value?.avatarUrl || "");

const displayShopName = computed(() => user.value?.name || shop.name);
const displayShopOwner = computed(() => user.value?.email || shop.owner);

const menuItems = computed<MenuItem[]>(() => [
  {
    label: "Profile",
    to: profilePath.value,
    icon: "customers_group",
    match: (path) => path.startsWith("/profile"),
  },
  {
    label: "Dashboard",
    to: "/",
    icon: "dashboard_grid",
    match: (path) => path === "/",
  },
  {
    label: "Orders",
    to: "/orders",
    icon: "orders_clipboard",
    match: (path) => path.startsWith("/orders") && path !== "/orders/new",
  },
  {
    label: "Customers",
    to: "/customers",
    icon: "customers_group",
    match: (path) => path.startsWith("/customers"),
  },
  {
    label: "Products",
    to: "/orders/new",
    icon: "products_box",
    match: (path) => path === "/orders/new",
  },
  {
    label: "Reports",
    to: "/reports",
    icon: "reports_chart",
    match: (path) => path.startsWith("/reports"),
  },
  {
    label: "Reminders",
    to: "/reminders/payment",
    icon: "reminders_bell",
    match: (path) => path.startsWith("/reminders"),
  },
  {
    label: "Settings",
    to: "/settings",
    icon: "settings_gear",
    match: (path) => path.startsWith("/settings"),
  },
  {
    label: "Help & Support",
    to: "/settings",
    icon: "help_circle",
    match: () => false,
  },
]);

const isActive = (item: MenuItem) => item.match(route.path);

async function handleLogout() {
  if (isLoggingOut.value) {
    return;
  }

  showLogoutConfirm.value = true;
}

async function confirmLogout() {
  if (isLoggingOut.value) {
    return;
  }

  isLoggingOut.value = true;

  try {
    await logout();
    await navigateTo("/login");
  } finally {
    isLoggingOut.value = false;
  }
}
</script>

<template>
  <div class="flex w-full flex-col gap-[14px]">
    <!-- Shop Card -->
    <section
      class="flex min-h-[74px] items-center gap-[12px] rounded-[28px] border border-white/90 bg-[var(--surface)] py-[13px] pl-[13px] pr-[12px] shadow-[var(--card-shadow)] backdrop-blur-[20px]"
    >
      <AvatarBubble :name="displayShopName" :src="displayAvatarUrl" size="sm" />

      <div class="min-w-0 flex-1">
        <h1
          class="m-0 truncate text-[16px] font-extrabold leading-[1.08] tracking-[-0.45px] text-[var(--text)]"
        >
          {{ displayShopName }}
        </h1>

        <p
          class="m-0 mt-[6px] truncate text-[12px] font-medium leading-none tracking-[-0.2px] text-[var(--muted)]"
        >
          {{ displayShopOwner }}
        </p>
      </div>
    </section>

    <!-- Settings Menu -->
    <section
      class="overflow-hidden rounded-[26px] border border-white/90 bg-[var(--surface)] px-[17px] shadow-[var(--card-shadow)] backdrop-blur-[20px]"
      aria-label="Settings menu"
    >
      <NuxtLink
        v-for="(item, index) in menuItems"
        :key="item.label"
        :to="item.to"
        class="flex min-h-[54px] items-center gap-[15px]"
        :class="{ 'border-t border-[var(--line)]': index > 0 }"
      >
        <span
          class="grid h-[34px] w-[34px] flex-none place-items-center rounded-full"
          :class="
            isActive(item)
              ? 'bg-[#f1edff] text-[var(--purple)]'
              : 'text-[var(--muted)]'
          "
        >
          <AppIcon :name="item.icon" :size="22" />
        </span>

        <span
          class="flex-1 text-[14px] font-semibold leading-none tracking-[-0.35px]"
          :class="
            isActive(item) ? 'text-[var(--purple-dark)]' : 'text-[var(--text)]'
          "
        >
          {{ item.label }}
        </span>

        <AppIcon
          name="chevron_right"
          :size="14"
          :class="
            isActive(item) ? 'text-[var(--purple)]' : 'text-[var(--muted)]'
          "
        />
      </NuxtLink>

      <!-- Logout -->
      <button
        class="flex min-h-[54px] w-full items-center gap-[15px] border-t border-[var(--line)] bg-transparent"
        type="button"
        :disabled="isLoggingOut"
        @click="handleLogout"
      >
        <span
          class="grid h-[34px] w-[34px] flex-none place-items-center rounded-full text-[var(--red)]"
        >
          <AppIcon name="logout" :size="22" />
        </span>

        <span
          class="flex-1 text-left text-[14px] font-semibold leading-none tracking-[-0.35px] text-[var(--red)]"
        >
          {{ isLoggingOut ? "Logging out..." : "Logout" }}
        </span>

        <span class="h-[14px] w-[14px] flex-none" aria-hidden="true" />
      </button>
    </section>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showLogoutConfirm"
        class="fixed inset-0 z-50 flex items-end bg-[#0b1020]/45 p-4 backdrop-blur-[2px]"
        @click.self="showLogoutConfirm = false"
      >
        <section
          class="w-full rounded-[28px] border border-white/90 bg-[var(--surface)] p-4 shadow-[0_30px_80px_rgba(15,23,42,0.3)]"
          role="dialog"
          aria-modal="true"
          aria-label="Logout confirmation"
        >
          <div class="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[var(--line)]" />

          <h2
            class="m-0 text-[18px] font-extrabold leading-none tracking-[-0.35px] text-[var(--text)]"
          >
            Log out?
          </h2>

          <p
            class="m-0 mt-2 text-[13px] font-medium leading-[1.45] tracking-[-0.2px] text-[var(--muted)]"
          >
            You will be signed out from this device and need to log in again.
          </p>

          <div class="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              class="h-11 rounded-[14px] border border-[var(--line)] bg-transparent text-[14px] font-bold text-[var(--text)]"
              :disabled="isLoggingOut"
              @click="showLogoutConfirm = false"
            >
              Cancel
            </button>

            <button
              type="button"
              class="h-11 rounded-[14px] bg-[var(--red)] text-[14px] font-bold text-white shadow-[0_10px_22px_rgba(255,59,86,0.32)] disabled:opacity-70"
              :disabled="isLoggingOut"
              @click="confirmLogout"
            >
              {{ isLoggingOut ? "Logging out..." : "Yes, log out" }}
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </div>
</template>
