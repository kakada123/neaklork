<script setup lang="ts">
definePageMeta({
  layout: "mobile",
});

const quantity = ref(1);
const paymentStatus = ref("unpaid");
const deliveryStatus = ref("not-yet");
const saved = ref(false);

const customerName = ref("");
const contact = ref("");
const socialHandle = ref("");
const price = ref("");
const note = ref("");

const paymentOptions = [
  { label: "Unpaid", value: "unpaid" },
  { label: "Partial", value: "partial" },
  { label: "Paid", value: "paid" },
];

const deliveryOptions = [
  { label: "Not yet", value: "not-yet", icon: "box_not_yet" },
  { label: "Delivering", value: "delivering", icon: "truck_delivering" },
  { label: "Delivered", value: "delivered", icon: "check_delivered" },
  { label: "Returned", value: "returned", icon: "return_returned" },
];

function decrementQuantity() {
  quantity.value = Math.max(1, quantity.value - 1);
}

function saveOrder() {
  saved.value = true;

  window.setTimeout(() => {
    navigateTo("/orders");
  }, 900);
}
</script>

<template>
  <form class="flex w-full flex-col gap-[14px]" @submit.prevent="saveOrder">
    <PageHeader title="Add Order" back />

    <!-- Customer Info -->
    <section
      class="rounded-[26px] border border-white/90 bg-[var(--surface)] p-4 shadow-[var(--card-shadow)] backdrop-blur-[20px]"
    >
      <h2
        class="m-0 mb-[14px] text-[16px] font-bold leading-tight tracking-[-0.35px] text-[var(--text)]"
      >
        Customer Info
      </h2>

      <div class="flex flex-col gap-[12px]">
        <input
          v-model="customerName"
          class="min-h-[48px] w-full rounded-[13px] border border-[#dce1ea] bg-white px-[14px] text-[14px] font-medium leading-none tracking-[-0.2px] text-[var(--text)] outline-none placeholder:text-[#818898]"
          type="text"
          placeholder="Customer name"
          autocomplete="name"
        />

        <input
          v-model="contact"
          class="min-h-[48px] w-full rounded-[13px] border border-[#dce1ea] bg-white px-[14px] text-[14px] font-medium leading-none tracking-[-0.2px] text-[var(--text)] outline-none placeholder:text-[#818898]"
          type="text"
          placeholder="Phone / Telegram"
          autocomplete="tel"
        />

        <input
          v-model="socialHandle"
          class="min-h-[48px] w-full rounded-[13px] border border-[#dce1ea] bg-white px-[14px] text-[14px] font-medium leading-none tracking-[-0.2px] text-[var(--text)] outline-none placeholder:text-[#818898]"
          type="text"
          placeholder="HQ-912-34-678 or Instagram"
        />
      </div>
    </section>

    <!-- Order Details -->
    <section
      class="rounded-[26px] border border-white/90 bg-[var(--surface)] p-4 shadow-[var(--card-shadow)] backdrop-blur-[20px]"
    >
      <h2
        class="m-0 mb-[14px] text-[16px] font-bold leading-tight tracking-[-0.35px] text-[var(--text)]"
      >
        Order Details
      </h2>

      <label
        class="mb-[8px] block text-[14px] font-bold leading-none tracking-[-0.25px] text-[var(--text)]"
        for="product-selector"
      >
        Product
      </label>

      <button
        id="product-selector"
        class="flex min-h-[48px] w-full items-center justify-between rounded-[13px] border border-[#dce1ea] bg-white px-[14px] text-[14px] font-medium leading-none tracking-[-0.2px] text-[#70778a]"
        type="button"
      >
        Select product
        <AppIcon name="chevron_right" :size="14" />
      </button>

      <div
        class="mt-[16px] grid grid-cols-[1.05fr_0.95fr] gap-[12px] max-[374px]:grid-cols-1"
      >
        <div>
          <span
            class="mb-[8px] block text-[14px] font-bold leading-none tracking-[-0.25px] text-[var(--text)]"
          >
            Quantity
          </span>

          <div
            class="grid min-h-[48px] w-full grid-cols-3 items-center overflow-hidden rounded-[13px] border border-[#dce1ea] bg-white text-[14px] text-[var(--text)]"
            aria-label="Quantity"
          >
            <button
              class="grid h-full place-items-center bg-transparent text-[#374151]"
              type="button"
              aria-label="Decrease quantity"
              @click="decrementQuantity"
            >
              <AppIcon name="minus" :size="16" />
            </button>

            <strong class="grid h-full place-items-center font-extrabold">
              {{ quantity }}
            </strong>

            <button
              class="grid h-full place-items-center bg-transparent text-[#374151]"
              type="button"
              aria-label="Increase quantity"
              @click="quantity++"
            >
              <AppIcon name="plus" :size="16" />
            </button>
          </div>
        </div>

        <div>
          <label
            class="mb-[8px] block text-[14px] font-bold leading-none tracking-[-0.25px] text-[var(--text)]"
            for="order-price"
          >
            Price
          </label>

          <input
            id="order-price"
            v-model="price"
            class="min-h-[48px] w-full rounded-[13px] border border-[#dce1ea] bg-white px-[14px] text-[14px] font-medium leading-none tracking-[-0.2px] text-[var(--text)] outline-none placeholder:text-[#818898]"
            type="text"
            inputmode="decimal"
            placeholder="$ 0.00"
          />
        </div>
      </div>
    </section>

    <!-- Payment Status -->
    <section
      class="rounded-[26px] border border-white/90 bg-[var(--surface)] p-4 shadow-[var(--card-shadow)] backdrop-blur-[20px]"
    >
      <h2
        class="m-0 mb-[14px] text-[16px] font-bold leading-tight tracking-[-0.35px] text-[var(--text)]"
      >
        Payment Status
      </h2>

      <div class="grid grid-cols-3 gap-[12px]">
        <button
          v-for="option in paymentOptions"
          :key="option.value"
          class="flex min-h-[48px] items-center justify-center gap-[8px] rounded-[14px] text-[14px] font-bold leading-none tracking-[-0.25px]"
          :class="
            paymentStatus === option.value
              ? 'bg-[#f0ecff] text-[var(--purple-dark)]'
              : 'bg-transparent text-[var(--muted)]'
          "
          type="button"
          @click="paymentStatus = option.value"
        >
          <AppIcon
            :name="
              paymentStatus === option.value
                ? 'radio_checked'
                : 'radio_unchecked'
            "
            :size="18"
          />

          {{ option.label }}
        </button>
      </div>
    </section>

    <!-- Delivery Status -->
    <section
      class="rounded-[26px] border border-white/90 bg-[var(--surface)] p-4 shadow-[var(--card-shadow)] backdrop-blur-[20px]"
    >
      <h2
        class="m-0 mb-[14px] text-[16px] font-bold leading-tight tracking-[-0.35px] text-[var(--text)]"
      >
        Delivery Status
      </h2>

      <div class="grid grid-cols-4 gap-[12px] max-[374px]:grid-cols-2">
        <button
          v-for="option in deliveryOptions"
          :key="option.value"
          class="flex min-w-0 flex-col items-center justify-center gap-[8px] rounded-[14px] px-[6px] py-[10px] text-center text-[12px] font-bold leading-tight tracking-[-0.15px]"
          :class="
            deliveryStatus === option.value
              ? 'bg-[#f0ecff] text-[var(--purple-dark)]'
              : 'bg-transparent text-[var(--muted)]'
          "
          type="button"
          @click="deliveryStatus = option.value"
        >
          <AppIcon :name="option.icon" :size="24" />

          <span class="truncate">
            {{ option.label }}
          </span>
        </button>
      </div>
    </section>

    <!-- Note + Save -->
    <section
      class="rounded-[26px] border border-white/90 bg-[var(--surface)] p-4 shadow-[var(--card-shadow)] backdrop-blur-[20px]"
    >
      <label
        class="mb-[8px] block text-[14px] font-bold leading-none tracking-[-0.25px] text-[var(--text)]"
        for="order-note"
      >
        Note <span class="text-[var(--muted)]">(optional)</span>
      </label>

      <textarea
        id="order-note"
        v-model="note"
        class="min-h-[78px] w-full resize-y rounded-[13px] border border-[#dce1ea] bg-white px-[14px] pt-[14px] text-[14px] font-medium leading-tight tracking-[-0.2px] text-[var(--text)] outline-none placeholder:text-[#818898]"
        placeholder="Add a note..."
      />

      <button
        class="mt-[16px] inline-flex min-h-[52px] w-full items-center justify-center gap-[8px] rounded-2xl bg-[linear-gradient(135deg,var(--purple),var(--purple-dark))] text-[15px] font-extrabold leading-none tracking-[-0.25px] text-white shadow-[0_16px_28px_rgba(108,78,247,0.24)]"
        type="submit"
      >
        Save Order
      </button>
    </section>

    <div
      v-if="saved"
      class="fixed inset-x-[18px] bottom-[92px] z-[70] mx-auto max-w-[394px] rounded-2xl bg-[#111827] px-4 py-[14px] text-center text-[14px] font-semibold leading-tight tracking-[-0.2px] text-white shadow-[var(--shadow)]"
      role="status"
    >
      Order saved. Returning to orders...
    </div>
  </form>
</template>
