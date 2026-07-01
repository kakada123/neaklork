<script setup lang="ts">
definePageMeta({
  layout: "mobile",
  showBottomNav: true,
});

useHead({
  title: "Products | NeakLork",
});

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

const form = reactive({
  name: "",
  sku: "",
  price: "",
  description: "",
});
const isSubmitting = ref(false);
const errorMessage = ref("");

const {
  data: products,
  pending: productsPending,
  refresh: refreshProducts,
} = useAsyncData<ProductItem[]>(
  "products-list",
  () => $fetch<ProductItem[]>("/api/products"),
  {
    server: false,
    default: () => [],
  },
);

const parsedPrice = computed(() => {
  if (!form.price.trim()) {
    return 0;
  }

  const price = Number(form.price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(price) ? Math.round(price * 100) / 100 : Number.NaN;
});

const canSubmit = computed(
  () => form.name.trim().length > 0 && Number.isFinite(parsedPrice.value),
);

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function resetForm() {
  form.name = "";
  form.sku = "";
  form.price = "";
  form.description = "";
}

async function handleSubmit() {
  if (!canSubmit.value || isSubmitting.value) {
    return;
  }

  errorMessage.value = "";
  isSubmitting.value = true;

  try {
    await $fetch<ProductItem>("/api/products", {
      method: "POST",
      body: {
        name: form.name.trim(),
        sku: form.sku.trim() || undefined,
        description: form.description.trim() || undefined,
        price: parsedPrice.value,
      },
    });

    resetForm();
    await refreshProducts();
  } catch (error) {
    errorMessage.value = getAuthErrorMessage(error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="flex w-full flex-col gap-[14px]">
    <PageHeader title="Products" />

    <form
      class="rounded-[26px] border border-white/90 bg-[var(--surface)] p-4 shadow-[var(--card-shadow)] backdrop-blur-[20px]"
      @submit.prevent="handleSubmit"
    >
      <h2
        class="m-0 mb-[14px] text-[16px] font-bold leading-tight tracking-[-0.35px] text-[var(--text)]"
      >
        Add Product
      </h2>

      <div class="flex flex-col gap-[12px]">
        <input
          v-model.trim="form.name"
          class="min-h-[48px] w-full rounded-[13px] border border-[#dce1ea] bg-white px-[14px] text-[14px] font-medium leading-none tracking-[-0.2px] text-[var(--text)] outline-none placeholder:text-[#818898]"
          type="text"
          autocomplete="off"
          placeholder="Product name"
          maxlength="120"
          required
        />

        <div class="grid grid-cols-[1fr_0.8fr] gap-[12px] max-[374px]:grid-cols-1">
          <input
            v-model.trim="form.sku"
            class="min-h-[48px] w-full rounded-[13px] border border-[#dce1ea] bg-white px-[14px] text-[14px] font-medium leading-none tracking-[-0.2px] text-[var(--text)] outline-none placeholder:text-[#818898]"
            type="text"
            autocomplete="off"
            placeholder="SKU"
            maxlength="60"
          />

          <input
            v-model="form.price"
            class="min-h-[48px] w-full rounded-[13px] border border-[#dce1ea] bg-white px-[14px] text-[14px] font-medium leading-none tracking-[-0.2px] text-[var(--text)] outline-none placeholder:text-[#818898]"
            type="text"
            inputmode="decimal"
            placeholder="$ 0.00"
          />
        </div>

        <textarea
          v-model.trim="form.description"
          class="min-h-[78px] w-full resize-y rounded-[13px] border border-[#dce1ea] bg-white px-[14px] pt-[14px] text-[14px] font-medium leading-tight tracking-[-0.2px] text-[var(--text)] outline-none placeholder:text-[#818898]"
          placeholder="Description"
          maxlength="500"
        />
      </div>

      <p
        v-if="errorMessage"
        class="m-0 mt-[12px] rounded-[18px] bg-[#fff0f3] px-[14px] py-[11px] text-[13px] font-bold leading-snug text-[var(--red)]"
      >
        {{ errorMessage }}
      </p>

      <button
        class="mt-[16px] inline-flex min-h-[52px] w-full items-center justify-center gap-[8px] rounded-2xl bg-[linear-gradient(135deg,var(--purple),var(--purple-dark))] text-[15px] font-extrabold leading-none tracking-[-0.25px] text-white shadow-[0_16px_28px_rgba(108,78,247,0.24)] disabled:cursor-not-allowed disabled:opacity-65"
        type="submit"
        :disabled="!canSubmit || isSubmitting"
      >
        {{ isSubmitting ? "Saving..." : "Save Product" }}
      </button>
    </form>

    <section
      class="overflow-hidden rounded-[26px] border border-white/90 bg-[var(--surface)] px-[17px] shadow-[var(--card-shadow)] backdrop-blur-[20px]"
      aria-label="Product list"
    >
      <div
        v-if="productsPending"
        class="grid min-h-[58px] place-items-center text-[14px] font-semibold text-[var(--muted)]"
      >
        Loading products...
      </div>

      <div
        v-else-if="products.length === 0"
        class="grid min-h-[74px] place-items-center text-center text-[14px] font-semibold leading-snug text-[var(--muted)]"
      >
        No products yet.
      </div>

      <template v-else>
        <article
          v-for="(product, index) in products"
          :key="product.id"
          class="grid min-h-[66px] grid-cols-[minmax(0,1fr)_auto] items-center gap-[14px]"
          :class="{ 'border-t border-[var(--line)]': index > 0 }"
        >
          <div class="min-w-0">
            <h2
              class="m-0 truncate text-[15px] font-extrabold leading-tight tracking-[-0.25px] text-[var(--text)]"
            >
              {{ product.name }}
            </h2>

            <p
              class="m-0 mt-[6px] truncate text-[12px] font-semibold leading-none text-[var(--muted)]"
            >
              {{ product.sku || "No SKU" }}
            </p>
          </div>

          <strong
            class="text-right text-[14px] font-extrabold leading-none text-[var(--text)]"
          >
            {{ formatMoney(product.price) }}
          </strong>
        </article>
      </template>
    </section>
  </div>
</template>
