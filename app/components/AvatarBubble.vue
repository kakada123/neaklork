<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    name: string;
    initials?: string;
    src?: string;
    size?: "sm" | "md" | "lg" | "xl";
  }>(),
  {
    initials: "",
    src: "",
    size: "md",
  },
);

const displayInitials = computed(() => {
  if (props.initials) {
    return props.initials;
  }

  return props.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
});

const sizeClass = computed(() => {
  if (props.size === "lg") {
    return "h-[72px] w-[72px] text-[22px]";
  }

  if (props.size === "xl") {
    return "h-20 w-20 text-2xl";
  }

  if (props.size === "sm") {
    return "h-12 w-12 text-[15px]";
  }

  return "h-12 w-12 text-lg";
});
</script>

<template>
  <span
    class="inline-grid flex-none place-items-center overflow-hidden rounded-full bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.85),transparent_28%),linear-gradient(135deg,#dae3ef,#bfc9d8)] font-extrabold text-[#111827]"
    :class="sizeClass"
  >
    <img
      v-if="src"
      :src="src"
      :alt="name"
      class="h-full w-full object-cover object-center"
    >
    <template v-else>
      {{ displayInitials }}
    </template>
  </span>
</template>
