<script setup lang="ts">
definePageMeta({
  layout: "mobile",
});

const route = useRoute();
const { orders } = useNeaklorkMock();

const order = computed(
  () => orders.find((item) => item.id === route.params.id) ?? orders[0],
);

const items = computed(() => {
  const [label, quantityPart] = order.value.productSummary.split(" x");
  const quantity = quantityPart ? `x${quantityPart}` : "";
  const total = Number(order.value.amount.replace(/[^0-9.]/g, ""));

  return [
    { label, quantity, amount: order.value.amount },
    { label: "Shipping", amount: "$5.00" },
    { label: "Discount", amount: "-$12.00" },
    { label: "Total", amount: `$${(total - 7).toFixed(2)}`, strong: true },
  ];
});

const orderStatusLabel = computed(() => {
  if (order.value.status === "new") {
    return "New";
  }

  if (order.value.status === "confirmed") {
    return "Confirmed";
  }

  if (order.value.status === "packing") {
    return "Packing";
  }

  if (order.value.status === "delivering") {
    return "Delivering";
  }

  if (order.value.status === "problem") {
    return "Problem";
  }

  return "Paid";
});

const paymentTone = computed(() => {
  if (order.value.paymentStatus === "paid") {
    return "green";
  }

  if (order.value.paymentStatus === "paypal") {
    return "blue";
  }

  return "orange";
});
</script>

<template>
  <div class="flex w-full flex-col gap-[14px]">
    <PageHeader title="Order Detail" back>
      <template #actions>
        <button
          class="inline-grid h-11 w-11 place-items-center rounded-2xl bg-transparent text-[var(--purple)] active:bg-[rgba(108,78,247,0.08)]"
          type="button"
          aria-label="More actions"
        >
          <span class="text-[22px] font-bold leading-none tracking-[-1px]"
            >...</span
          >
        </button>
      </template>
    </PageHeader>

    <!-- Order Info -->
    <section
      class="rounded-[26px] border border-white/90 bg-[var(--surface)] p-4 shadow-[var(--card-shadow)] backdrop-blur-[20px]"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h2
            class="m-0 truncate text-[22px] font-extrabold leading-tight tracking-[-0.7px] text-[var(--text)]"
          >
            #{{ order.id }}
          </h2>

          <p
            class="m-0 mt-[7px] text-[13px] font-medium leading-tight tracking-[-0.15px] text-[var(--muted)]"
          >
            {{ order.timeAgo }}
          </p>
        </div>

        <StatusBadge :label="orderStatusLabel" tone="blue" />
      </div>

      <div
        class="mt-[16px] flex items-center gap-[14px] border-t border-[var(--line)] pt-[16px]"
      >
        <AvatarBubble
          :name="order.customerName"
          :initials="order.customerInitials"
          size="sm"
        />

        <div class="min-w-0 flex-1">
          <h3
            class="m-0 truncate text-[17px] font-extrabold leading-tight tracking-[-0.35px] text-[var(--text)]"
          >
            {{ order.customerName }}
          </h3>

          <p
            class="m-0 mt-[7px] truncate text-sm font-medium leading-tight tracking-[-0.15px] text-[var(--muted)]"
          >
            {{ order.customerPhone }}
          </p>
        </div>

        <div class="flex flex-none gap-[8px]">
          <a
            class="grid h-10 w-10 place-items-center rounded-[14px] bg-[#f2f8f3]"
            :href="`tel:${order.customerPhone}`"
            aria-label="Call customer"
          >
            <AppIcon name="phone" :size="20" />
          </a>

          <a
            class="grid h-10 w-10 place-items-center rounded-[14px] bg-[#edf7ff]"
            href="https://t.me/"
            aria-label="Open Telegram"
          >
            <AppIcon name="telegram" :size="20" />
          </a>
        </div>
      </div>
    </section>

    <!-- Items -->
    <h2
      class="mx-2 m-0 text-[16px] font-bold leading-tight tracking-[-0.35px] text-[var(--text)]"
    >
      Items
    </h2>

    <section
      class="overflow-hidden rounded-[26px] border border-white/90 bg-[var(--surface)] px-[17px] shadow-[var(--card-shadow)] backdrop-blur-[20px]"
    >
      <div
        v-for="(item, index) in items"
        :key="item.label"
        class="grid min-h-[48px] grid-cols-[minmax(0,1fr)_auto] items-center gap-[14px]"
        :class="{ 'border-t border-[var(--line)]': index > 0 }"
      >
        <span
          class="min-w-0 truncate text-[14px] leading-none tracking-[-0.35px] text-[var(--text)]"
          :class="item.strong ? 'font-extrabold' : 'font-semibold'"
        >
          {{ item.label }}

          <span v-if="item.quantity" class="font-medium text-[var(--muted)]">
            {{ item.quantity }}
          </span>
        </span>

        <strong
          class="text-[14px] font-extrabold leading-none tracking-[-0.35px] text-[var(--text)]"
        >
          {{ item.amount }}
        </strong>
      </div>
    </section>

    <!-- Status -->
    <h2
      class="mx-2 m-0 text-[16px] font-bold leading-tight tracking-[-0.35px] text-[var(--text)]"
    >
      Status
    </h2>

    <section
      class="overflow-hidden rounded-[26px] border border-white/90 bg-[var(--surface)] px-[17px] shadow-[var(--card-shadow)] backdrop-blur-[20px]"
    >
      <div
        class="grid min-h-[54px] grid-cols-[auto_1fr] items-center gap-[14px]"
      >
        <StatusBadge :label="order.paymentLabel" :tone="paymentTone" icon="payment_card" />

        <span
          class="text-[14px] font-semibold leading-none tracking-[-0.35px] text-[var(--text)]"
        >
          Payment
        </span>
      </div>

      <div
        class="grid min-h-[54px] grid-cols-[auto_1fr] items-center gap-[14px] border-t border-[var(--line)]"
      >
        <StatusBadge :label="order.statusLabel" tone="purple" icon="delivery_status_truck" />

        <span
          class="text-[14px] font-semibold leading-none tracking-[-0.35px] text-[var(--text)]"
        >
          Delivery
        </span>
      </div>
    </section>

    <!-- Actions -->
    <h2
      class="mx-2 m-0 text-[16px] font-bold leading-tight tracking-[-0.35px] text-[var(--text)]"
    >
      Actions
    </h2>

    <section class="grid grid-cols-2 gap-[12px]">
      <NuxtLink
        to="/reminders/payment"
        class="inline-flex min-h-[48px] items-center justify-center gap-[8px] rounded-[14px] bg-[#f3efff] text-[14px] font-bold leading-none tracking-[-0.25px] text-[var(--purple-dark)]"
      >
        <AppIcon name="copy" :size="18" />
        Copy Reminder
      </NuxtLink>

      <NuxtLink
        to="/orders/new"
        class="inline-flex min-h-[48px] items-center justify-center gap-[8px] rounded-[14px] bg-[#f7f7fb] text-[14px] font-bold leading-none tracking-[-0.25px] text-[#111827]"
      >
        <AppIcon name="edit_pencil" :size="18" />
        Edit Order
      </NuxtLink>

      <button
        class="col-span-full inline-flex min-h-[48px] items-center justify-center gap-[8px] rounded-[14px] border border-[rgba(244,63,94,0.12)] bg-[#fff1f3] text-[14px] font-bold leading-none tracking-[-0.25px] text-[#ef2f43]"
        type="button"
      >
        <AppIcon name="alert_triangle" :size="18" />
        Mark as Problem
      </button>
    </section>
  </div>
</template>
