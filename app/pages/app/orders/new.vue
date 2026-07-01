<script setup lang="ts">
definePageMeta({
  layout: "mobile",
});

type PaymentStatus = "unpaid" | "paid" | "partial" | "paypal";
type OrderStatus =
  | "new"
  | "confirmed"
  | "packing"
  | "delivering"
  | "paid"
  | "problem";

interface ProductItem {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const quantity = ref(1);
const paymentStatus = ref<PaymentStatus>("unpaid");
const orderStatus = ref<OrderStatus>("new");
const saved = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref("");

const customerName = ref("");
const contact = ref("");
const selectedProductId = ref("");
const customProductName = ref("");
const price = ref("");

const {
  data: products,
  pending: productsPending,
} = useAsyncData<ProductItem[]>(
  "order-form-products",
  () => $fetch<ProductItem[]>("/api/products"),
  {
    server: false,
    default: () => [],
  },
);

const paymentOptions = [
  { label: "Unpaid", value: "unpaid" as const },
  { label: "Partial", value: "partial" as const },
  { label: "Paid", value: "paid" as const },
];

const orderStatusOptions = [
  { label: "New", value: "new" as const, icon: "status_new" },
  { label: "Confirmed", value: "confirmed" as const, icon: "status_confirmed" },
  { label: "Packing", value: "packing" as const, icon: "status_packing" },
  {
    label: "Delivering",
    value: "delivering" as const,
    icon: "status_delivering",
  },
  { label: "Paid", value: "paid" as const, icon: "status_paid" },
  { label: "Problem", value: "problem" as const, icon: "status_problem" },
];

const selectedProduct = computed(
  () =>
    (products.value ?? []).find(
      (product) => product.id === selectedProductId.value,
    ),
);

const productLabel = computed(
  () => selectedProduct.value?.name || customProductName.value.trim(),
);

const unitPrice = computed(() => {
  const amount = Number(price.value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(amount) ? Math.round(amount * 100) / 100 : Number.NaN;
});

const orderTotal = computed(() =>
  Number.isFinite(unitPrice.value)
    ? Math.round(unitPrice.value * quantity.value * 100) / 100
    : 0,
);

const canSubmit = computed(
  () =>
    customerName.value.trim().length > 0 &&
    contact.value.trim().length > 0 &&
    productLabel.value.length > 0 &&
    Number.isFinite(unitPrice.value) &&
    unitPrice.value > 0,
);

watch(selectedProduct, (product) => {
  if (!product) {
    return;
  }

  price.value = product.price.toFixed(2);
});

function decrementQuantity() {
  quantity.value = Math.max(1, quantity.value - 1);
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

async function saveOrder() {
  if (!canSubmit.value || isSubmitting.value) {
    return;
  }

  errorMessage.value = "";
  isSubmitting.value = true;

  try {
    await $fetch("/api/orders", {
      method: "POST",
      body: {
        customerName: customerName.value.trim(),
        customerPhone: contact.value.trim(),
        productSummary: `${productLabel.value} x${quantity.value}`,
        amountValue: orderTotal.value,
        status: orderStatus.value,
        paymentStatus: paymentStatus.value,
      },
    });

    await Promise.all([
      refreshNuxtData("neaklork-app-seed"),
      refreshNuxtData("orders-list"),
    ]);

    saved.value = true;

    window.setTimeout(() => {
      navigateTo("/orders");
    }, 900);
  } catch (error) {
    errorMessage.value = getAuthErrorMessage(error);
  } finally {
    isSubmitting.value = false;
  }
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
          required
        />

        <input
          v-model="contact"
          class="min-h-[48px] w-full rounded-[13px] border border-[#dce1ea] bg-white px-[14px] text-[14px] font-medium leading-none tracking-[-0.2px] text-[var(--text)] outline-none placeholder:text-[#818898]"
          type="text"
          placeholder="Phone / Telegram"
          autocomplete="tel"
          required
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

      <select
        id="product-selector"
        v-model="selectedProductId"
        class="min-h-[48px] w-full rounded-[13px] border border-[#dce1ea] bg-white px-[14px] text-[14px] font-medium leading-none tracking-[-0.2px] text-[var(--text)] outline-none"
        :disabled="productsPending"
      >
        <option value="">
          {{ productsPending ? "Loading products..." : "Select product" }}
        </option>

        <option
          v-for="product in products"
          :key="product.id"
          :value="product.id"
        >
          {{ product.name }} - {{ formatMoney(product.price) }}
        </option>
      </select>

      <input
        v-if="!selectedProductId"
        v-model.trim="customProductName"
        class="mt-[12px] min-h-[48px] w-full rounded-[13px] border border-[#dce1ea] bg-white px-[14px] text-[14px] font-medium leading-none tracking-[-0.2px] text-[var(--text)] outline-none placeholder:text-[#818898]"
        type="text"
        autocomplete="off"
        placeholder="Or type a custom product"
        maxlength="120"
      />

      <p
        v-if="!productsPending && products.length === 0"
        class="m-0 mt-[10px] text-[12px] font-semibold leading-tight text-[var(--muted)]"
      >
        Add reusable products from
        <NuxtLink class="font-black text-[var(--purple)]" to="/products">
          Products
        </NuxtLink>
        .
      </p>

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
            required
          />
        </div>
      </div>

      <p
        class="m-0 mt-[12px] text-right text-[13px] font-bold leading-none text-[var(--muted)]"
      >
        Total: {{ formatMoney(orderTotal) }}
      </p>
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

    <!-- Order Status -->
    <section
      class="rounded-[26px] border border-white/90 bg-[var(--surface)] p-4 shadow-[var(--card-shadow)] backdrop-blur-[20px]"
    >
      <h2
        class="m-0 mb-[14px] text-[16px] font-bold leading-tight tracking-[-0.35px] text-[var(--text)]"
      >
        Order Status
      </h2>

      <div class="grid grid-cols-3 gap-[12px] max-[374px]:grid-cols-2">
        <button
          v-for="option in orderStatusOptions"
          :key="option.value"
          class="flex min-w-0 flex-col items-center justify-center gap-[8px] rounded-[14px] px-[6px] py-[10px] text-center text-[12px] font-bold leading-tight tracking-[-0.15px]"
          :class="
            orderStatus === option.value
              ? 'bg-[#f0ecff] text-[var(--purple-dark)]'
              : 'bg-transparent text-[var(--muted)]'
          "
          type="button"
          @click="orderStatus = option.value"
        >
          <AppIcon :name="option.icon" :size="24" />

          <span class="truncate">
            {{ option.label }}
          </span>
        </button>
      </div>
    </section>

    <!-- Save -->
    <section
      class="rounded-[26px] border border-white/90 bg-[var(--surface)] p-4 shadow-[var(--card-shadow)] backdrop-blur-[20px]"
    >
      <p
        v-if="errorMessage"
        class="m-0 rounded-[18px] bg-[#fff0f3] px-[14px] py-[11px] text-[13px] font-bold leading-snug text-[var(--red)]"
      >
        {{ errorMessage }}
      </p>

      <button
        class="inline-flex min-h-[52px] w-full items-center justify-center gap-[8px] rounded-2xl bg-[linear-gradient(135deg,var(--purple),var(--purple-dark))] text-[15px] font-extrabold leading-none tracking-[-0.25px] text-white shadow-[0_16px_28px_rgba(108,78,247,0.24)] disabled:cursor-not-allowed disabled:opacity-65"
        :class="{ 'mt-[16px]': errorMessage }"
        type="submit"
        :disabled="!canSubmit || isSubmitting"
      >
        {{ isSubmitting ? "Saving..." : "Save Order" }}
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
