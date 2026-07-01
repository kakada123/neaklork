<script setup lang="ts">
definePageMeta({
  layout: "mobile",
  showBottomNav: true,
});

const { customers } = useNeaklorkMock();
const search = ref("");

const filteredCustomers = computed(() => {
  const query = search.value.trim().toLowerCase();

  if (!query) {
    return customers.value;
  }

  return customers.value.filter((customer) => {
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.phone.toLowerCase().includes(query)
    );
  });
});
</script>

<template>
  <div class="flex w-full flex-col gap-[14px]">
    <!-- Header -->
    <header class="flex min-h-[46px] items-center justify-between">
      <h1
        class="m-0 text-[30px] font-extrabold leading-none tracking-[-1px] text-[var(--text)]"
      >
        Customers
      </h1>

      <button
        class="inline-grid h-11 w-11 place-items-center rounded-2xl bg-transparent text-[var(--purple)] active:bg-[rgba(108,78,247,0.08)]"
        type="button"
        aria-label="Add customer"
      >
        <AppIcon name="add_user" :size="22" />
      </button>
    </header>

    <!-- Search -->
    <label
      class="flex min-h-[52px] items-center gap-[12px] rounded-[18px] bg-[#f2f1f9] px-[15px]"
      for="customer-search"
    >
      <AppIcon name="search" :size="20" class="text-[var(--muted)]" />

      <input
        id="customer-search"
        v-model="search"
        class="w-full border-0 bg-transparent text-[14px] font-medium leading-none tracking-[-0.2px] text-[var(--text)] outline-none placeholder:text-[#858b98]"
        type="search"
        placeholder="Search customers by name or phone"
      />
    </label>

    <!-- Customer List -->
    <section class="flex flex-col gap-[12px]" aria-label="Customer list">
      <article
        v-for="customer in filteredCustomers"
        :key="customer.phone"
        class="grid min-h-[94px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[14px] rounded-[26px] border border-white/90 bg-[var(--surface)] p-4 pb-[15px] shadow-[var(--card-shadow)] backdrop-blur-[20px] max-[374px]:grid-cols-1"
      >
        <AvatarBubble :name="customer.name" size="sm" />

        <div class="min-w-0">
          <h2
            class="m-0 truncate text-[17px] font-extrabold leading-tight tracking-[-0.35px] text-[var(--text)]"
          >
            {{ customer.name }}
          </h2>

          <p
            class="m-0 mt-[7px] truncate text-sm font-medium leading-tight tracking-[-0.15px] text-[var(--muted)]"
          >
            {{ customer.phone }}
          </p>
        </div>

        <div
          class="grid grid-cols-[repeat(2,minmax(68px,1fr))] gap-[12px] text-center max-[374px]:w-full max-[374px]:text-left"
        >
          <div>
            <span
              class="block whitespace-nowrap text-[11px] font-medium leading-none tracking-[-0.15px] text-[var(--muted)]"
            >
              Total Orders
            </span>

            <strong
              class="mt-[7px] block text-[17px] font-extrabold leading-tight tracking-[-0.35px] text-[var(--text)]"
            >
              {{ customer.totalOrders }}
            </strong>
          </div>

          <div
            class="border-l border-[var(--line)] pl-[12px] max-[374px]:border-l-0"
          >
            <span
              class="block whitespace-nowrap text-[11px] font-medium leading-none tracking-[-0.15px] text-[var(--muted)]"
            >
              Total Spent
            </span>

            <strong
              class="mt-[7px] block text-[17px] font-extrabold leading-tight tracking-[-0.35px] text-[var(--text)]"
            >
              {{ customer.totalSpent }}
            </strong>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>
