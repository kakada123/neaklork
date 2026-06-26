<script setup lang="ts">
interface NavItem {
  label: string;
  to: string;
  icon: string;
  center?: boolean;
  match: (path: string) => boolean;
}

const route = useRoute();

const navItemClass =
  "group relative flex min-h-[54px] min-w-0 flex-col items-center justify-center gap-[5px] rounded-[18px] text-center text-[13px] font-bold leading-none transition active:scale-[0.96]";

const activeClass = "text-[var(--purple)]";
const inactiveClass = "text-[#73788c]";

const firstItem = computed<NavItem>(() => {
  if (route.path === "/") {
    return {
      label: "Home",
      to: "/",
      icon: "nav_home",
      match: (path) => path === "/",
    };
  }

  return {
    label: "Orders",
    to: "/orders",
    icon: "orders_clipboard",
    match: (path) => path.startsWith("/orders") && path !== "/orders/new",
  };
});

const navItems = computed<NavItem[]>(() => [
  firstItem.value,
  {
    label: "Customers",
    to: "/customers",
    icon: "nav_customers",
    match: (path) => path.startsWith("/customers"),
  },
  {
    label: "Add Order",
    to: "/orders/new",
    icon: "nav_add_order_plus",
    center: true,
    match: (path) => path === "/orders/new",
  },
  {
    label: "Reports",
    to: "/reports",
    icon: "nav_reports",
    match: (path) => path.startsWith("/reports"),
  },
  {
    label: "Settings",
    to: "/settings",
    icon: "nav_settings",
    match: (path) => path.startsWith("/settings"),
  },
]);

const isActive = (item: NavItem) => item.match(route.path);
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-[35] mx-auto w-[min(100%,430px)] overflow-visible rounded-t-[28px] border-t border-black/5 bg-white/95 px-[18px] pb-[calc(14px_+_env(safe-area-inset-bottom))] pt-[12px] shadow-[0_-14px_40px_rgba(15,23,42,0.10)] backdrop-blur-xl"
    aria-label="App navigation"
  >
    <div class="grid grid-cols-5 items-end gap-0">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :aria-label="item.label"
        :class="[navItemClass, isActive(item) ? activeClass : inactiveClass]"
      >
        <template v-if="item.center">
          <div
            class="absolute left-1/2 -top-[28px] grid h-[60px] w-[60px] -translate-x-1/2 place-items-center rounded-full"
          >
            <span
              class="grid h-[50px] w-[50px] place-items-center rounded-full bg-[linear-gradient(135deg,#7048ff_0%,#5b31ef_52%,#4f22e8_100%)] text-white transition group-active:scale-95"
            >
              <AppIcon :name="item.icon" :size="22" />
            </span>
          </div>

          <span class="mt-[27px] truncate">
            {{ item.label }}
          </span>
        </template>

        <template v-else>
          <AppIcon :name="item.icon" :size="22" class="shrink-0 transition" />

          <span class="truncate">
            {{ item.label }}
          </span>
        </template>
      </NuxtLink>
    </div>
  </nav>
</template>
