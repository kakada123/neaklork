<script setup lang="ts">
const route = useRoute();

const showBottomNav = computed(() => route.meta.showBottomNav === true);
</script>

<template>
  <main
    class="relative mx-auto min-h-dvh max-w-[430px] overflow-x-hidden bg-transparent shadow-[0_0_0_1px_rgba(15,23,42,0.04)]"
  >
    <section
      class="min-h-dvh px-[18px] pt-[20px] max-[374px]:px-[14px]"
      :class="showBottomNav ? 'pb-[152px]' : 'pb-[146px]'"
    >
      <slot />
    </section>

    <AppBottomNav v-if="showBottomNav" />
  </main>
</template>
