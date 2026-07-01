<script setup lang="ts">
definePageMeta({
  layout: "mobile",
  showBottomNav: true,
});

const { orders, statusTabs } = useNeaklorkMock();

const activeTab = ref("New");
const sheetOpen = ref(false);
const selectedStatus = ref("new");

const filteredOrders = computed(() => {
  const activeStatus = activeTab.value.toLowerCase();

  return orders.value.filter((order) => order.status === activeStatus);
});

function paymentTone(paymentStatus: string): "orange" | "green" | "blue" {
  if (paymentStatus === "paid") {
    return "green";
  }

  if (paymentStatus === "paypal") {
    return "blue";
  }

  return "orange";
}

function openMoveSheet(status: string) {
  selectedStatus.value = status;
  sheetOpen.value = true;
}

function selectStatus(status: string) {
  selectedStatus.value = status;
  sheetOpen.value = false;
}
</script>

<template>
  <div class="flex w-full flex-col gap-[14px]">
    <!-- Header -->
    <header class="flex min-h-[46px] items-center justify-between">
      <h1
        class="m-0 text-[30px] font-extrabold leading-none tracking-[-1px] text-[var(--text)]"
      >
        Orders
      </h1>

      <div class="inline-flex gap-[8px]">
        <button
          class="inline-grid h-11 w-11 place-items-center rounded-2xl bg-transparent text-[var(--purple)] active:bg-[rgba(108,78,247,0.08)]"
          type="button"
          aria-label="Search orders"
        >
          <AppIcon name="search" :size="22" />
        </button>

        <button
          class="inline-grid h-11 w-11 place-items-center rounded-2xl bg-transparent text-[var(--purple)] active:bg-[rgba(108,78,247,0.08)]"
          type="button"
          aria-label="Filter orders"
        >
          <AppIcon name="filter" :size="22" />
        </button>
      </div>
    </header>

    <!-- Status Tabs -->
    <div
      class="-mx-[18px] flex gap-[22px] overflow-x-auto border-b border-[var(--line)] px-[18px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Order statuses"
    >
      <button
        v-for="tab in statusTabs"
        :key="tab.label"
        class="relative flex-none bg-transparent py-[14px] text-[14px] font-bold leading-none tracking-[-0.25px]"
        :class="
          activeTab === tab.label
            ? 'text-[var(--purple-dark)]'
            : 'text-[var(--muted)]'
        "
        type="button"
        @click="activeTab = tab.label"
      >
        {{ tab.label }}

        <span v-if="tab.count">&nbsp;{{ tab.count }}</span>

        <span
          v-if="activeTab === tab.label"
          class="absolute inset-x-0 bottom-[-1px] h-[3px] rounded-full bg-[var(--purple-dark)]"
          aria-hidden="true"
        />
      </button>
    </div>

    <!-- Orders -->
    <section class="flex flex-col gap-[12px]" aria-label="Orders">
      <article
        v-for="order in filteredOrders"
        :key="order.id"
        class="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-[14px] rounded-[26px] border border-white/90 bg-[var(--surface)] p-4 shadow-[var(--card-shadow)] backdrop-blur-[20px]"
      >
        <AvatarBubble
          :name="order.customerName"
          :initials="order.customerInitials"
          size="sm"
        />

        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-[8px]">
            <h2
              class="m-0 text-[17px] font-extrabold leading-tight tracking-[-0.35px] text-[var(--text)]"
            >
              #{{ order.id }}
            </h2>

            <StatusBadge :label="order.statusLabel" tone="purple" />
          </div>

          <p
            class="m-0 mt-[7px] truncate text-[15px] font-extrabold leading-tight tracking-[-0.25px] text-[var(--text)]"
          >
            {{ order.customerName }}
          </p>

          <p
            class="m-0 mt-[7px] truncate text-sm font-medium leading-tight tracking-[-0.15px] text-[var(--muted)]"
          >
            {{ order.productSummary }}
          </p>

          <div class="mt-[10px]">
            <StatusBadge
              :label="order.paymentLabel"
              :tone="paymentTone(order.paymentStatus)"
              icon="payment_card"
            />
          </div>
        </div>

        <div
          class="flex min-w-[68px] flex-col items-end justify-between gap-[12px] text-right"
        >
          <span
            class="text-[13px] font-medium leading-none tracking-[-0.15px] text-[var(--muted)]"
          >
            {{ order.timeAgo }}
          </span>

          <strong
            class="text-[17px] font-extrabold leading-tight tracking-[-0.35px] text-[var(--text)]"
          >
            {{ order.amount }}
          </strong>
        </div>

        <div class="col-span-full mt-[2px] grid grid-cols-2 gap-[12px]">
          <NuxtLink
            v-if="order.paymentStatus !== 'paid'"
            to="/reminders/payment"
            class="inline-flex min-h-[48px] items-center justify-center gap-[8px] rounded-[14px] bg-[#f3efff] text-[14px] font-bold leading-none tracking-[-0.25px] text-[var(--purple-dark)]"
          >
            <AppIcon name="copy" :size="18" />
            Copy Reminder
          </NuxtLink>

          <NuxtLink
            v-else
            :to="`/orders/${order.id}`"
            class="inline-flex min-h-[48px] items-center justify-center gap-[8px] rounded-[14px] bg-[#f7f7fb] text-[14px] font-bold leading-none tracking-[-0.25px] text-[#111827]"
          >
            <AppIcon name="eye" :size="18" />
            View
          </NuxtLink>

          <button
            class="inline-flex min-h-[48px] items-center justify-center gap-[8px] rounded-[14px] bg-[#f7f7fb] text-[14px] font-bold leading-none tracking-[-0.25px] text-[#111827]"
            type="button"
            @click="openMoveSheet(order.status)"
          >
            <AppIcon name="move" :size="18" />
            Move
          </button>
        </div>
      </article>
    </section>

    <StatusBottomSheet
      :open="sheetOpen"
      :current="selectedStatus"
      @close="sheetOpen = false"
      @select="selectStatus"
    />
  </div>
</template>
