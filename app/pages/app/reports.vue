<script setup lang="ts">
definePageMeta({
  layout: "mobile",
  showBottomNav: true,
});

const { topProducts, orders } = useNeaklorkMock();

const activeRange = ref("Today");
const ranges = ["Today", "This Week", "This Month"];

const rangeSeries = computed(() => {
  const sortedOrders = [...orders.value].sort(
    (left, right) => Number(left.id) - Number(right.id),
  );

  if (activeRange.value === "Today") {
    return sortedOrders.slice(0, 4);
  }

  if (activeRange.value === "This Week") {
    return sortedOrders.slice(0, 5);
  }

  return sortedOrders;
});

const reportsSummary = computed(() => {
  const orderList = rangeSeries.value;
  const paidOrders = orderList.filter((order) => order.paymentStatus === "paid");
  const unpaidOrders = orderList.filter((order) => order.paymentStatus !== "paid");

  return {
    totalSales: orderList.reduce(
      (sum, order) => sum + Number(order.amount.replace(/[^0-9.]/g, "")),
      0,
    ),
    orders: orderList.length,
    paid: paidOrders.length,
    unpaid: unpaidOrders.length,
  };
});

const chartData = computed(() => {
  const values = rangeSeries.value.map((order, index) => ({
    label: order.id,
    value: Number(order.amount.replace(/[^0-9.]/g, "")),
    index,
  }));

  const width = 360;
  const height = 190;
  const padding = { left: 34, right: 16, top: 24, bottom: 36 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(...values.map((item) => item.value), 1);
  const minValue = Math.min(...values.map((item) => item.value), 0);
  const valueRange = Math.max(maxValue - minValue, 1);
  const step = values.length > 1 ? innerWidth / (values.length - 1) : 0;

  const points = values.map((item, index) => {
    const x = padding.left + index * step;
    const normalized = (item.value - minValue) / valueRange;
    const y = padding.top + (1 - normalized) * innerHeight;

    return {
      ...item,
      x,
      y,
    };
  });

  const path = points.length
    ? points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")
    : "";

  const areaPath = points.length
    ? `${path} L ${padding.left + innerWidth} ${padding.top + innerHeight} L ${padding.left} ${padding.top + innerHeight} Z`
    : "";

  const ticks = Array.from({ length: 5 }, (_, index) => {
    const ratio = index / 4;
    const value = maxValue - ratio * valueRange;

    return {
      value,
      y: padding.top + ratio * innerHeight,
    };
  });

  return {
    points,
    path,
    areaPath,
    ticks,
  };
});
</script>

<template>
  <div class="flex w-full flex-col gap-[14px]">
    <!-- Header -->
    <header class="flex min-h-[46px] items-center justify-between">
      <h1
        class="m-0 text-[30px] font-extrabold leading-none tracking-[-1px] text-[var(--text)]"
      >
        Reports
      </h1>

      <button
        class="inline-grid h-11 w-11 place-items-center rounded-2xl bg-transparent text-[var(--purple)] active:bg-[rgba(108,78,247,0.08)]"
        type="button"
        aria-label="Choose report date"
      >
        <AppIcon name="calendar" :size="22" />
      </button>
    </header>

    <!-- Range Tabs -->
    <div
      class="grid grid-cols-3 border-b border-[var(--line)]"
      aria-label="Report range"
    >
      <button
        v-for="range in ranges"
        :key="range"
        class="relative min-h-[44px] bg-transparent text-[14px] font-bold leading-none tracking-[-0.25px]"
        :class="
          activeRange === range
            ? 'text-[var(--purple-dark)]'
            : 'text-[var(--muted)]'
        "
        type="button"
        @click="activeRange = range"
      >
        {{ range }}

        <span
          v-if="activeRange === range"
          class="absolute inset-x-0 bottom-[-1px] h-[3px] rounded-full bg-[var(--purple-dark)]"
          aria-hidden="true"
        />
      </button>
    </div>

    <!-- Summary Card -->
    <section
      class="rounded-[28px] bg-[radial-gradient(circle_at_18%_16%,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(255,255,255,0.13),transparent_25%),linear-gradient(135deg,var(--purple-start)_0%,var(--purple-mid)_48%,var(--purple-dark)_100%)] px-[22px] py-[22px] text-white shadow-[var(--purple-shadow)]"
    >
      <div class="flex items-start justify-between gap-[14px]">
        <div class="min-w-0">
          <h2
            class="m-0 text-[16px] font-bold leading-none tracking-[-0.45px] text-white"
          >
            Total Sales
          </h2>

          <strong
            class="mt-[13px] block whitespace-nowrap text-[28px] font-extrabold leading-none tracking-[-0.9px] text-white"
          >
            ${{ reportsSummary.totalSales.toFixed(2) }}
          </strong>
        </div>

        <p
          class="m-0 shrink-0 text-right text-[16px] font-extrabold leading-none tracking-[-0.35px] text-[#a7f383]"
        >
          +12.5%

          <span
            class="mt-[7px] block text-[12px] font-medium leading-none tracking-[-0.2px] text-white/75"
          >
            vs yesterday
          </span>
        </p>
      </div>

      <div
        class="mt-[22px] grid grid-cols-3 border-t border-white/25 pt-[20px] text-center"
      >
        <div>
          <span
            class="block text-[13px] font-medium leading-none tracking-[-0.2px] text-white/80"
          >
            Orders
          </span>

          <strong
            class="mt-[10px] block text-[24px] font-extrabold leading-none tracking-[-0.7px] text-white"
          >
            {{ reportsSummary.orders }}
          </strong>
        </div>

        <div class="border-l border-white/25">
          <span
            class="block text-[13px] font-medium leading-none tracking-[-0.2px] text-white/80"
          >
            Paid
          </span>

          <strong
            class="mt-[10px] block text-[24px] font-extrabold leading-none tracking-[-0.7px] text-white"
          >
            {{ reportsSummary.paid }}
          </strong>
        </div>

        <div class="border-l border-white/25">
          <span
            class="block text-[13px] font-medium leading-none tracking-[-0.2px] text-white/80"
          >
            Unpaid
          </span>

          <strong
            class="mt-[10px] block text-[24px] font-extrabold leading-none tracking-[-0.7px] text-white"
          >
            {{ reportsSummary.unpaid }}
          </strong>
        </div>
      </div>
    </section>

    <!-- Sales Chart -->
    <section
      class="rounded-[26px] border border-white/90 bg-[var(--surface)] p-4 shadow-[var(--card-shadow)] backdrop-blur-[20px]"
    >
      <div class="mb-[12px] flex items-center justify-between gap-3">
        <h2
          class="m-0 text-[16px] font-bold leading-tight tracking-[-0.35px] text-[var(--text)]"
        >
          Sales Chart
        </h2>

        <button
          class="inline-flex min-h-[34px] items-center gap-[6px] rounded-xl border border-[var(--line)] bg-white px-3 text-[13px] font-bold leading-none tracking-[-0.2px] text-[var(--text)]"
          type="button"
        >
          Hourly
          <AppIcon name="chevron_down" :size="12" />
        </button>
      </div>

      <svg
        class="block h-auto w-full"
        viewBox="0 0 360 190"
        role="img"
        aria-label="Hourly sales line chart"
      >
        <g stroke="#e5e7eb" stroke-dasharray="3 4" stroke-width="1">
          <line
            v-for="tick in chartData.ticks"
            :key="tick.y"
            x1="34"
            :y1="tick.y"
            x2="344"
            :y2="tick.y"
          />
        </g>

        <g fill="#6b7280" font-size="11">
          <text
            v-for="tick in chartData.ticks"
            :key="tick.y"
            x="8"
            :y="tick.y + 4"
          >
            {{ Math.round(tick.value) }}
          </text>

          <text
            v-for="point in chartData.points"
            :key="point.label"
            :x="point.x - 14"
            y="188"
          >
            #{{ point.label }}
          </text>
        </g>

        <path
          :d="chartData.path"
          fill="none"
          stroke="#5b35f1"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="3"
        />

        <path
          :d="chartData.areaPath"
          fill="url(#salesFade)"
        />

        <g fill="#ffffff" stroke="#5b35f1" stroke-width="3">
          <circle
            v-for="point in chartData.points"
            :key="point.label"
            :cx="point.x"
            :cy="point.y"
            :r="point.index === chartData.points.length - 1 ? 5 : 4"
          />
        </g>

        <defs>
          <linearGradient id="salesFade" x1="0" x2="0" y1="0" y2="1">
            <stop stop-color="#6c4ef7" stop-opacity="0.18" />
            <stop offset="1" stop-color="#6c4ef7" stop-opacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </section>

    <!-- Top Products -->
    <section
      class="overflow-hidden rounded-[26px] border border-white/90 bg-[var(--surface)] px-[17px] shadow-[var(--card-shadow)] backdrop-blur-[20px]"
    >
      <h2
        class="m-0 py-[15px] text-[16px] font-bold leading-tight tracking-[-0.35px] text-[var(--text)]"
      >
        Top Products
      </h2>

      <div>
        <div
          v-for="(product, index) in topProducts"
          :key="product.name"
          class="grid min-h-[48px] grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-[12px]"
          :class="{ 'border-t border-[var(--line)]': index > 0 }"
        >
          <span
            class="text-[13px] font-semibold leading-none tracking-[-0.2px] text-[var(--muted)]"
          >
            {{ index + 1 }}
          </span>

          <strong
            class="truncate text-[14px] font-semibold leading-none tracking-[-0.35px] text-[var(--text)]"
          >
            {{ product.name }}
          </strong>

          <strong
            class="text-[14px] font-extrabold leading-none tracking-[-0.35px] text-[var(--text)]"
          >
            {{ product.amount }}
          </strong>
        </div>
      </div>
    </section>
  </div>
</template>
