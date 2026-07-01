<script setup lang="ts">
definePageMeta({
  layout: "mobile",
  showBottomNav: true,
});

type PaymentStatus = "all" | "unpaid" | "paid" | "partial" | "paypal";
type OrderStatus =
  | "new"
  | "confirmed"
  | "packing"
  | "delivering"
  | "paid"
  | "problem";

interface OrderItem {
  id: string;
  customerName: string;
  customerPhone: string;
  productSummary: string;
  amountValue: number;
  minutesAgo: number;
  status: OrderStatus;
  statusLabel: string;
  paymentStatus: Exclude<PaymentStatus, "all">;
  paymentLabel: string;
}

const statusTabs: Array<{ label: string; value: "all" | OrderStatus }> = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Packing", value: "packing" },
  { label: "Delivering", value: "delivering" },
  { label: "Paid", value: "paid" },
  { label: "Problem", value: "problem" },
];

const paymentOptions: Array<{ label: string; value: PaymentStatus }> = [
  { label: "All payments", value: "all" },
  { label: "Unpaid", value: "unpaid" },
  { label: "Partial", value: "partial" },
  { label: "Paid", value: "paid" },
  { label: "Paypal", value: "paypal" },
];

const activeStatus = ref<"all" | OrderStatus>("all");
const paymentFilter = ref<PaymentStatus>("all");
const searchQuery = ref("");
const sheetOpen = ref(false);
const selectedStatus = ref<OrderStatus>("new");
const selectedOrderId = ref("");
const isUpdatingStatus = ref(false);
const statusError = ref("");

const {
  data: rawOrders,
  pending: ordersPending,
  refresh: refreshOrders,
} = useAsyncData<OrderItem[]>(
  "orders-list",
  () =>
    $fetch<OrderItem[]>("/api/orders", {
      query: {
        status: activeStatus.value === "all" ? undefined : activeStatus.value,
        paymentStatus:
          paymentFilter.value === "all" ? undefined : paymentFilter.value,
        search: searchQuery.value.trim() || undefined,
      },
    }),
  {
    server: false,
    default: () => [],
    watch: [activeStatus, paymentFilter, searchQuery],
  },
);

const orders = computed(() =>
  (rawOrders.value ?? []).map((order) => ({
    ...order,
    amount: formatMoney(order.amountValue),
    customerInitials: deriveInitials(order.customerName),
    timeAgo: formatRelativeMinutes(order.minutesAgo),
  })),
);

function paymentTone(paymentStatus: string): "orange" | "green" | "blue" {
  if (paymentStatus === "paid") {
    return "green";
  }

  if (paymentStatus === "paypal") {
    return "blue";
  }

  return "orange";
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatRelativeMinutes(minutesAgo: number) {
  if (minutesAgo < 60) {
    return `${minutesAgo}m ago`;
  }

  const hours = Math.round(minutesAgo / 60);
  return `${hours}h ago`;
}

function deriveInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function openMoveSheet(order: { id: string; status: OrderStatus }) {
  selectedOrderId.value = order.id;
  selectedStatus.value = order.status;
  statusError.value = "";
  sheetOpen.value = true;
}

async function selectStatus(status: string) {
  if (!selectedOrderId.value || isUpdatingStatus.value) {
    return;
  }

  selectedStatus.value = status as OrderStatus;
  isUpdatingStatus.value = true;
  statusError.value = "";

  try {
    await $fetch(`/api/orders/${selectedOrderId.value}/status`, {
      method: "PATCH",
      body: {
        status,
      },
    });

    await Promise.all([
      refreshOrders(),
      refreshNuxtData("neaklork-app-seed"),
    ]);
    sheetOpen.value = false;
  } catch (error) {
    statusError.value = getAuthErrorMessage(error);
  } finally {
    isUpdatingStatus.value = false;
  }
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
        <NuxtLink
          to="/orders/new"
          class="inline-grid h-11 w-11 place-items-center rounded-2xl bg-transparent text-[var(--purple)] active:bg-[rgba(108,78,247,0.08)]"
          aria-label="Add order"
        >
          <AppIcon name="plus" :size="22" />
        </NuxtLink>

        <NuxtLink
          to="/products"
          class="inline-grid h-11 w-11 place-items-center rounded-2xl bg-transparent text-[var(--purple)] active:bg-[rgba(108,78,247,0.08)]"
          aria-label="Products"
        >
          <AppIcon name="products_box" :size="22" />
        </NuxtLink>
      </div>
    </header>

    <!-- Search -->
    <label
      class="flex min-h-[48px] items-center gap-[10px] rounded-[18px] border border-white/90 bg-[var(--surface)] px-[14px] shadow-[var(--soft-shadow)] backdrop-blur-[20px]"
    >
      <AppIcon name="search" :size="18" class="text-[var(--muted)]" />

      <input
        v-model="searchQuery"
        class="min-w-0 flex-1 bg-transparent text-[14px] font-semibold leading-none text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
        type="search"
        placeholder="Search order, customer, phone"
      />
    </label>

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
          activeStatus === tab.value
            ? 'text-[var(--purple-dark)]'
            : 'text-[var(--muted)]'
        "
        type="button"
        @click="activeStatus = tab.value"
      >
        {{ tab.label }}

        <span
          v-if="activeStatus === tab.value"
          class="absolute inset-x-0 bottom-[-1px] h-[3px] rounded-full bg-[var(--purple-dark)]"
          aria-hidden="true"
        />
      </button>
    </div>

    <!-- Payment Filter -->
    <div
      class="-mx-[18px] flex gap-[8px] overflow-x-auto px-[18px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Payment filter"
    >
      <button
        v-for="option in paymentOptions"
        :key="option.value"
        class="min-h-[36px] flex-none rounded-[14px] px-[13px] text-[13px] font-bold leading-none"
        :class="
          paymentFilter === option.value
            ? 'bg-[#f0ecff] text-[var(--purple-dark)]'
            : 'bg-white/70 text-[var(--muted)]'
        "
        type="button"
        @click="paymentFilter = option.value"
      >
        {{ option.label }}
      </button>
    </div>

    <p
      v-if="statusError"
      class="m-0 rounded-[18px] bg-[#fff0f3] px-[14px] py-[11px] text-[13px] font-bold leading-snug text-[var(--red)]"
    >
      {{ statusError }}
    </p>

    <!-- Orders -->
    <section class="flex flex-col gap-[12px]" aria-label="Orders">
      <div
        v-if="ordersPending"
        class="grid min-h-[90px] place-items-center rounded-[26px] border border-white/90 bg-[var(--surface)] text-[14px] font-semibold text-[var(--muted)] shadow-[var(--card-shadow)]"
      >
        Loading orders...
      </div>

      <div
        v-else-if="orders.length === 0"
        class="grid min-h-[110px] place-items-center rounded-[26px] border border-white/90 bg-[var(--surface)] px-5 text-center text-[14px] font-semibold leading-snug text-[var(--muted)] shadow-[var(--card-shadow)]"
      >
        No orders match this filter.
      </div>

      <template v-else>
        <article
          v-for="order in orders"
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
              :disabled="isUpdatingStatus"
              @click="openMoveSheet(order)"
            >
              <AppIcon name="move" :size="18" />
              Move
            </button>
          </div>
        </article>
      </template>
    </section>

    <StatusBottomSheet
      :open="sheetOpen"
      :current="selectedStatus"
      @close="sheetOpen = false"
      @select="selectStatus"
    />
  </div>
</template>
