<script setup lang="ts">
definePageMeta({
  layout: "mobile",
});

const { reminderTemplates } = useNeaklorkMock();

const copiedTemplate = ref("");

async function copyMessage(title: string, message: string) {
  if (import.meta.client && "clipboard" in navigator) {
    await navigator.clipboard.writeText(message);
  }

  copiedTemplate.value = title;

  window.setTimeout(() => {
    copiedTemplate.value = "";
  }, 1400);
}
</script>

<template>
  <div class="flex w-full flex-col gap-[14px]">
    <PageHeader title="Payment Reminder" back />

    <!-- Info Banner -->
    <div
      class="flex min-h-[52px] items-center gap-[12px] rounded-[18px] bg-[#e8f5ff] px-[15px] text-[14px] font-semibold leading-tight tracking-[-0.2px] text-[#1377d7]"
    >
      <AppIcon name="info_circle" :size="20" />
      <span>Tap to copy and send to customer</span>
    </div>

    <!-- Templates -->
    <section
      v-for="template in reminderTemplates"
      :key="template.title"
      class="rounded-[26px] border border-white/90 bg-[var(--surface)] p-4 shadow-[var(--card-shadow)] backdrop-blur-[20px]"
    >
      <p
        class="m-0 mb-[16px] whitespace-pre-line text-[15px] font-semibold leading-[1.6] tracking-[-0.25px] text-[#161a2d]"
      >
        {{ template.message }}
      </p>

      <button
        class="inline-flex min-h-[48px] w-full items-center justify-center gap-[8px] rounded-[14px] bg-[#f3efff] text-[14px] font-bold leading-none tracking-[-0.25px] text-[var(--purple-dark)]"
        type="button"
        @click="copyMessage(template.title, template.message)"
      >
        <AppIcon name="copy_message" :size="18" />
        {{ copiedTemplate === template.title ? "Copied" : "Copy Message" }}
      </button>
    </section>

    <!-- Custom Message -->
    <button
      class="mt-[2px] inline-flex min-h-[52px] w-full items-center justify-center gap-[8px] rounded-2xl border border-[var(--purple-dark)] bg-transparent text-[15px] font-extrabold leading-none tracking-[-0.25px] text-[var(--purple-dark)]"
      type="button"
    >
      Create Custom Message
    </button>
  </div>
</template>
