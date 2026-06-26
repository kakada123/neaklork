<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    name: string;
    size?: number | string;
    alt?: string;
    decorative?: boolean;
  }>(),
  {
    size: 24,
    alt: "",
    decorative: true,
  },
);

const primeIconMap: Record<string, string> = {
  add_user: "pi-user-plus",
  alert_triangle: "pi-exclamation-triangle",
  app_logo_bag: "pi-shopping-bag",
  arrow_left: "pi-arrow-left",
  bell: "pi-bell",
  box_not_yet: "pi-box",
  calendar: "pi-calendar",
  check_delivered: "pi-check-circle",
  chevron_down: "pi-chevron-down",
  chevron_right: "pi-chevron-right",
  copy: "pi-copy",
  copy_message: "pi-copy",
  customers_group: "pi-users",
  dashboard_grid: "pi-th-large",
  delivery_status_truck: "pi-truck",
  edit_pencil: "pi-pencil",
  eye: "pi-eye",
  filter: "pi-filter",
  help_circle: "pi-question-circle",
  info_circle: "pi-info-circle",
  logout: "pi-sign-out",
  minus: "pi-minus",
  move: "pi-arrow-right-arrow-left",
  nav_add_order_plus: "pi-plus",
  nav_customers: "pi-users",
  nav_home: "pi-home",
  nav_reports: "pi-clipboard",
  nav_settings: "pi-cog",
  need_action_need_delivery: "pi-truck",
  need_action_need_payment: "pi-truck",
  need_action_new_orders: "pi-exclamation-circle",
  need_action_problem_orders: "pi-box",
  orders_clipboard: "pi-clipboard",
  payment_card: "pi-credit-card",
  phone: "pi-phone",
  plus: "pi-plus",
  products_box: "pi-box",
  radio_checked: "pi-check-circle",
  radio_unchecked: "pi-circle",
  reminders_bell: "pi-bell",
  reports_chart: "pi-chart-bar",
  return_returned: "pi-undo",
  search: "pi-search",
  settings_gear: "pi-cog",
  status_confirmed: "pi-check-circle",
  status_delivering: "pi-truck",
  status_new: "pi-sparkles",
  status_packing: "pi-box",
  status_paid: "pi-wallet",
  status_problem: "pi-exclamation-triangle",
  telegram: "pi-telegram",
  truck_delivering: "pi-truck",
};

const iconClass = computed(() => primeIconMap[props.name] ?? "pi-circle");

const iconSize = computed(() =>
  typeof props.size === "number" ? `${props.size}px` : props.size,
);

const isAppLogo = computed(() => props.name === "app_logo_bag");

const actionIconThemeMap: Record<
  string,
  {
    wrapper: string;
    icon: string;
  }
> = {
  need_action_new_orders: {
    wrapper:
      "bg-[linear-gradient(135deg,#ffb02e_0%,#ff8a00_100%)] shadow-[0_5px_12px_rgba(255,138,0,0.26)]",
    icon: "text-white",
  },
  need_action_need_payment: {
    wrapper:
      "bg-[linear-gradient(135deg,#35d631_0%,#19b809_100%)] shadow-[0_5px_12px_rgba(25,184,9,0.24)]",
    icon: "text-white",
  },
  need_action_need_delivery: {
    wrapper:
      "bg-[linear-gradient(135deg,#35d7df_0%,#16b9c4_100%)] shadow-[0_5px_12px_rgba(22,185,196,0.24)]",
    icon: "text-white",
  },
  need_action_problem_orders: {
    wrapper:
      "bg-[linear-gradient(135deg,#ffeef2_0%,#ffd3dc_100%)] shadow-[0_5px_12px_rgba(255,59,86,0.16)]",
    icon: "text-[#ff3b56]",
  },
};

const actionTheme = computed(() => actionIconThemeMap[props.name]);

const rootStyle = computed(() => ({
  width: iconSize.value,
  height: iconSize.value,
}));

const plainIconStyle = computed(() => ({
  fontSize: iconSize.value,
}));

const innerIconStyle = computed(() => {
  const size = Number.parseFloat(String(props.size));

  if (!Number.isNaN(size)) {
    return {
      fontSize: `${Math.max(12, size * 0.48)}px`,
    };
  }

  return {
    fontSize: "14px",
  };
});
</script>

<template>
  <!-- App logo: purple rounded bag like screenshot -->
  <span
    v-if="isAppLogo"
    class="inline-grid flex-none place-items-center rounded-[7px] bg-[linear-gradient(135deg,#6846ff_0%,#4f2df5_100%)] text-white shadow-[0_6px_14px_rgba(79,45,245,0.24)]"
    :aria-hidden="decorative ? 'true' : undefined"
    :aria-label="decorative ? undefined : alt"
    :role="decorative ? undefined : 'img'"
    :style="rootStyle"
  >
    <i
      class="pi pi-shopping-bag inline-flex items-center justify-center leading-none"
      :style="innerIconStyle"
    />
  </span>

  <!-- Need action icons: colored rounded squares -->
  <span
    v-else-if="actionTheme"
    class="inline-grid flex-none place-items-center rounded-[8px]"
    :class="actionTheme.wrapper"
    :aria-hidden="decorative ? 'true' : undefined"
    :aria-label="decorative ? undefined : alt"
    :role="decorative ? undefined : 'img'"
    :style="rootStyle"
  >
    <i
      class="pi inline-flex items-center justify-center leading-none"
      :class="[iconClass, actionTheme.icon]"
      :style="innerIconStyle"
    />
  </span>

  <!-- Normal icons -->
  <i
    v-else
    class="pi inline-flex flex-none items-center justify-center leading-none text-current"
    :class="iconClass"
    :aria-hidden="decorative ? 'true' : undefined"
    :aria-label="decorative ? undefined : alt"
    :role="decorative ? undefined : 'img'"
    :style="[rootStyle, plainIconStyle]"
  />
</template>
