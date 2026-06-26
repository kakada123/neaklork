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

const menuItems: MenuItem[] = [
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
];

const isActive = (item: MenuItem) => item.match(route.path);
</script>

<template>
  <div class="flex w-full flex-col gap-[14px]">
    <!-- Shop Card -->
    <section
      class="flex min-h-[74px] items-center gap-[12px] rounded-[28px] border border-white/90 bg-[var(--surface)] py-[13px] pl-[13px] pr-[12px] shadow-[var(--card-shadow)] backdrop-blur-[20px]"
    >
      <img
        src="/image/saller/kakada.png"
        :alt="shop.name"
        class="h-12 w-12 flex-none rounded-full object-cover object-center"
      />

      <div class="min-w-0 flex-1">
        <h1
          class="m-0 truncate text-[16px] font-extrabold leading-[1.08] tracking-[-0.45px] text-[var(--text)]"
        >
          {{ shop.name }}
        </h1>

        <p
          class="m-0 mt-[6px] truncate text-[12px] font-medium leading-none tracking-[-0.2px] text-[var(--muted)]"
        >
          {{ shop.owner }}
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
      >
        <span
          class="grid h-[34px] w-[34px] flex-none place-items-center rounded-full text-[var(--red)]"
        >
          <AppIcon name="logout" :size="22" />
        </span>

        <span
          class="flex-1 text-left text-[14px] font-semibold leading-none tracking-[-0.35px] text-[var(--red)]"
        >
          Logout
        </span>

        <span class="h-[14px] w-[14px] flex-none" aria-hidden="true" />
      </button>
    </section>
  </div>
</template>
