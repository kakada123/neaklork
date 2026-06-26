<script setup lang="ts">
definePageMeta({
  layout: "mobile",
  showBottomNav: true,
});

const { topProducts } = useNeaklorkMock();

const activeRange = ref("Today");
const ranges = ["Today", "This Week", "This Month"];
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
            $128.00
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
            17
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
            14
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
            3
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
          <line x1="34" y1="24" x2="344" y2="24" />
          <line x1="34" y1="62" x2="344" y2="62" />
          <line x1="34" y1="100" x2="344" y2="100" />
          <line x1="34" y1="138" x2="344" y2="138" />
        </g>

        <g fill="#6b7280" font-size="11">
          <text x="8" y="28">500</text>
          <text x="8" y="66">375</text>
          <text x="8" y="104">250</text>
          <text x="8" y="142">125</text>
          <text x="18" y="174">0</text>
          <text x="34" y="188">00:00</text>
          <text x="110" y="188">06:00</text>
          <text x="192" y="188">12:00</text>
          <text x="278" y="188">18:00</text>
        </g>

        <path
          d="M34 154 L62 149 L86 149 L106 126 L124 106 L144 104 L158 72 L178 64 L196 24 L214 58 L230 48 L252 36 L276 75 L300 76 L320 122 L344 151"
          fill="none"
          stroke="#5b35f1"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="3"
        />

        <path
          d="M34 154 L62 149 L86 149 L106 126 L124 106 L144 104 L158 72 L178 64 L196 24 L214 58 L230 48 L252 36 L276 75 L300 76 L320 122 L344 151 L344 160 L34 160 Z"
          fill="url(#salesFade)"
        />

        <g fill="#ffffff" stroke="#5b35f1" stroke-width="3">
          <circle cx="34" cy="154" r="4" />
          <circle cx="62" cy="149" r="4" />
          <circle cx="86" cy="149" r="4" />
          <circle cx="106" cy="126" r="4" />
          <circle cx="124" cy="106" r="4" />
          <circle cx="144" cy="104" r="4" />
          <circle cx="158" cy="72" r="4" />
          <circle cx="178" cy="64" r="4" />
          <circle cx="196" cy="24" r="5" />
          <circle cx="214" cy="58" r="4" />
          <circle cx="230" cy="48" r="4" />
          <circle cx="252" cy="36" r="4" />
          <circle cx="276" cy="75" r="4" />
          <circle cx="300" cy="76" r="4" />
          <circle cx="320" cy="122" r="4" />
          <circle cx="344" cy="151" r="4" />
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
