<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    back?: boolean;
  }>(),
  {
    back: false,
  },
);

const router = useRouter();
</script>

<template>
  <header class="grid min-h-[72px] grid-cols-[44px_1fr_44px] items-center">
    <button
      v-if="back"
      class="inline-grid h-11 w-11 place-items-center rounded-2xl bg-transparent active:bg-[rgba(108,78,247,0.08)]"
      type="button"
      aria-label="Go back"
      @click="router.back()"
    >
      <AppIcon name="arrow_left" :size="30" />
    </button>
    <h1
      class="m-0 text-[30px] font-extrabold leading-tight text-[var(--text)]"
      :class="back ? 'col-start-2 text-center' : 'col-span-2'"
    >
      {{ title }}
    </h1>
    <div class="col-start-3 inline-flex items-center justify-end gap-3">
      <slot name="actions" />
    </div>
  </header>
</template>
