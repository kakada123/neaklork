<script setup lang="ts">
definePageMeta({
  layout: "mobile",
  showBottomNav: true,
});

const { shop, actionItems, dashboardSummary } = useNeaklorkMock();
const { user } = useAuth();

const displayShopName = computed(() => shop.name || user.value?.name || "Shop");
const displayShopId = computed(() =>
  shop.id
    ? `#${shop.id.slice(-6).toUpperCase()}`
    : user.value?.id
      ? `#${user.value.id.slice(-6).toUpperCase()}`
      : "",
);
const profilePath = computed(() => `/profile/${user.value?.id ?? "me"}`);
const displayAvatarUrl = computed(() => user.value?.avatarUrl || "");
const recentOrder = computed(() => dashboardSummary.value.recentOrder);
</script>

<template>
  <div class="neaklork-home flex w-full flex-col gap-[14px]">
    <!-- Header -->
    <header class="flex min-h-[46px] items-center justify-between">
      <div class="flex items-center gap-[10px]">
        <AppIcon name="app_logo_bag" :size="34" />

        <h1
          class="m-0 text-[30px] font-extrabold leading-none tracking-[-1px] text-[var(--purple)]"
        >
          NeakLork
        </h1>
      </div>

      <button
        class="relative grid h-11 w-11 place-items-center rounded-2xl bg-transparent"
        type="button"
        aria-label="Notifications"
      >
        <AppIcon name="bell" :size="22" class="text-[var(--purple)]" />

        <span
          class="absolute right-[1px] top-[-1px] grid h-[22px] min-w-[22px] place-items-center rounded-full border-2 border-white bg-[var(--red)] px-1 text-xs font-black leading-none text-white shadow-[0_6px_14px_rgba(255,59,86,0.32)]"
        >
          2
        </span>
      </button>
    </header>

    <!-- Shop Card -->
    <NuxtLink
      :to="profilePath"
      class="flex min-h-[74px] items-center gap-[12px] rounded-[28px] border border-white/90 bg-[var(--surface)] py-[13px] pl-[13px] pr-[12px] shadow-[var(--card-shadow)] backdrop-blur-[20px]"
    >
      <AvatarBubble :name="displayShopName" :src="displayAvatarUrl" size="sm" />

      <div class="min-w-0 flex-1">
        <h2
          class="m-0 truncate text-[16px] font-extrabold leading-[1.08] tracking-[-0.45px] text-[var(--text)]"
        >
          {{ displayShopName }}
        </h2>

        <p
          class="m-0 mt-[6px] text-[12px] font-medium leading-none tracking-[-0.2px] text-[var(--muted)]"
        >
          ID: {{ displayShopId }}
        </p>
      </div>

      <span
        class="grid h-9 w-9 flex-none place-items-center rounded-full bg-[#f2edff] text-[var(--purple)]"
      >
        <AppIcon name="chevron_down" :size="12" />
      </span>
    </NuxtLink>

    <!-- Today Overview -->
    <section
      class="relative h-[226px] overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.2),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(255,255,255,0.13),transparent_25%),linear-gradient(135deg,#7048ff_0%,#5b31ef_52%,#4f22e8_100%)] px-[22px] py-[22px] text-white shadow-[0_18px_38px_rgba(83,45,236,0.26)]"
    >
      <!-- Header -->
      <div class="flex items-start justify-between gap-4">
        <h2
          class="m-0 text-[16px] font-bold leading-none tracking-[-0.45px] text-white"
        >
          Today Overview
        </h2>

        <p
          class="m-0 shrink-0 text-[14px] font-medium leading-none tracking-[-0.25px] text-white/85"
        >
          {{ dashboardSummary.todayLabel }}
        </p>
      </div>

      <!-- Metrics -->
      <div class="relative mt-[34px]">
        <!-- Dividers -->
        <div
          class="pointer-events-none absolute left-0 right-0 top-[64px] h-px bg-white/25"
        />

        <div
          class="pointer-events-none absolute left-1/2 top-[3px] h-[50px] w-px -translate-x-1/2 bg-white/25"
        />

        <div
          class="pointer-events-none absolute left-1/2 top-[82px] h-[48px] w-px -translate-x-1/2 bg-white/25"
        />

        <!-- Grid -->
        <div class="grid grid-cols-2 gap-y-[36px]">
          <!-- Sales -->
          <div class="min-w-0 pr-[26px]">
            <span
              class="block text-[14px] font-medium leading-none tracking-[-0.25px] text-white/85"
            >
              Sales
            </span>

            <strong
              class="mt-[13px] block whitespace-nowrap text-[22px] font-extrabold leading-none tracking-[-0.85px] text-white"
            >
              {{ dashboardSummary.sales }}
            </strong>
          </div>

          <!-- Orders -->
          <div class="min-w-0 pl-[26px]">
            <span
              class="block text-[14px] font-medium leading-none tracking-[-0.25px] text-white/85"
            >
              Orders
            </span>

            <strong
              class="mt-[13px] block whitespace-nowrap text-[22px] font-extrabold leading-none tracking-[-0.85px] text-white"
            >
              {{ dashboardSummary.orders }}
            </strong>
          </div>

          <!-- Unpaid -->
          <div class="min-w-0 pr-[26px]">
            <span
              class="block text-[14px] font-medium leading-none tracking-[-0.25px] text-white/85"
            >
              Unpaid
            </span>

            <strong
              class="mt-[13px] block whitespace-nowrap text-[22px] font-extrabold leading-none tracking-[-0.85px] text-white"
            >
              {{ dashboardSummary.unpaid }}
            </strong>
          </div>

          <!-- Delivering -->
          <div class="min-w-0 pl-[26px]">
            <span
              class="block text-[14px] font-medium leading-none tracking-[-0.25px] text-white/85"
            >
              Delivering
            </span>

            <strong
              class="mt-[13px] block whitespace-nowrap text-[22px] font-extrabold leading-none tracking-[-0.85px] text-white"
            >
              {{ dashboardSummary.delivering }}
            </strong>
          </div>
        </div>
      </div>
    </section>

    <!-- Action Title -->
    <h2
      class="mx-2 text-[16px] font-bold leading-tight tracking-[-0.35px] text-[var(--text)]"
    >
      Need Your Action
    </h2>

    <!-- Action List -->
    <section
      class="overflow-hidden rounded-[26px] border border-white/90 bg-[var(--surface)] px-[17px] shadow-[var(--card-shadow)] backdrop-blur-[20px]"
      aria-label="Need your action"
    >
      <NuxtLink
        v-for="(item, index) in actionItems"
        :key="item.label"
        to="/orders"
        class="flex min-h-[48px] items-center gap-[15px]"
        :class="{ 'border-t border-[var(--line)]': index > 0 }"
      >
        <AppIcon :name="item.icon" :size="30" />

        <span
          class="flex-1 text-[14px] font-semibold leading-none tracking-[-0.35px] text-[var(--text)]"
        >
          {{ item.label }}
        </span>

        <span
          class="grid h-[22px] min-w-[22px] place-items-center rounded-full bg-[var(--red)] px-[6px] text-[11px] font-black leading-none text-white"
        >
          {{ item.count }}
        </span>

        <AppIcon name="chevron_right" :size="14" />
      </NuxtLink>
    </section>

    <!-- Recent Orders Header -->
    <div class="flex items-center justify-between px-2">
      <h2
        class="m-0 text-[16px] font-bold leading-tight tracking-[-0.35px] text-[var(--text)]"
      >
        Recent Orders
      </h2>

      <NuxtLink
        to="/orders"
        class="inline-flex items-center gap-1 text-[14px] font-bold leading-none tracking-[-0.25px] text-[var(--purple)]"
      >
        View all
        <AppIcon name="chevron_right" :size="14" />
      </NuxtLink>
    </div>

    <!-- Recent Order Card -->
    <NuxtLink
      :to="recentOrder ? `/orders/${recentOrder.id}` : '/orders'"
      class="grid min-h-[94px] grid-cols-[auto_minmax(0,1fr)_auto] gap-[14px] rounded-[26px] border border-white/90 bg-[var(--surface)] p-4 pb-[15px] shadow-[var(--card-shadow)] backdrop-blur-[20px]"
    >
      <AvatarBubble
        :name="recentOrder?.customerName || 'Recent Order'"
        :initials="recentOrder?.customerInitials || ''"
        size="sm"
      />

      <div class="min-w-0">
        <h3
          class="m-0 truncate text-[17px] font-extrabold leading-tight tracking-[-0.35px] text-[var(--text)]"
        >
          #{{ recentOrder?.id || '----' }}
          <span class="ml-2 font-medium">{{ recentOrder?.customerName || 'Recent Order' }}</span>
        </h3>

        <p
          class="m-0 mt-[7px] inline-flex items-center gap-[6px] text-sm font-medium leading-tight tracking-[-0.15px] text-[var(--muted)]"
        >
          <AppIcon name="products_box" :size="16" />
          {{ recentOrder?.productSummary || 'No items' }}
        </p>

        <p
          class="m-0 mt-[7px] truncate text-sm font-medium leading-tight tracking-[-0.15px] text-[var(--muted)]"
        >
          {{ recentOrder?.timeAgo || 'Just now' }}
        </p>
      </div>

      <div class="flex min-w-[74px] flex-col items-end text-right">
        <strong
          class="text-[17px] font-extrabold leading-tight tracking-[-0.35px] text-[var(--orange)]"
        >
          {{ recentOrder?.amount || '$0.00' }}
        </strong>

        <span
          class="mt-2 block text-[15px] font-medium leading-tight tracking-[-0.2px] text-[var(--orange)]"
        >
          {{ recentOrder?.paymentLabel || 'Unpaid' }}
        </span>
      </div>
    </NuxtLink>
  </div>
</template>
