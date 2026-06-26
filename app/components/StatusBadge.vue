<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string;
    tone?: "purple" | "orange" | "green" | "blue" | "red";
    icon?: string;
  }>(),
  {
    tone: "purple",
    icon: "",
  },
);

const toneClass = computed(() => {
  if (props.tone === "orange") {
    return "bg-[#fff2e4] text-[var(--orange)]";
  }

  if (props.tone === "green") {
    return "bg-[#e8f8e9] text-[#1a9e43]";
  }

  if (props.tone === "blue") {
    return "bg-[#e7f4ff] text-[var(--blue)]";
  }

  if (props.tone === "red") {
    return "bg-[#ffe9ee] text-[var(--red)]";
  }

  return "bg-[#f0ecff] text-[var(--purple-dark)]";
});
</script>

<template>
  <span
    class="inline-flex min-h-[26px] w-max items-center gap-[6px] rounded-full px-[11px] py-[5px] text-xs font-black uppercase"
    :class="toneClass"
  >
    <AppIcon v-if="icon" :name="icon" :size="18" />
    {{ label }}
  </span>
</template>
