<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    open: boolean;
    current?: string;
  }>(),
  {
    current: "new",
  },
);

const emit = defineEmits<{
  close: [];
  select: [value: string];
}>();

const { statusOptions } = useNeaklorkMock();

function isSelected(status: string) {
  return status === props.current;
}

function statusIconClass(status: string) {
  const tones: Record<string, string> = {
    new: "bg-[#eef6ff] text-[#1377d7]",
    pending: "bg-[#fff7ed] text-[#f97316]",
    preparing: "bg-[#fff7ed] text-[#f97316]",
    delivering: "bg-[#eff6ff] text-[#2563eb]",
    delivered: "bg-[#ecfdf5] text-[#16a34a]",
    completed: "bg-[#ecfdf5] text-[#16a34a]",

    problem: "bg-[#fff1f3] text-[#ef2f43]",
    returned: "bg-[#fff1f3] text-[#ef2f43]",
    cancelled: "bg-[#f3f4f6] text-[#4b5563]",
  };

  return tones[status] ?? "bg-[#f3efff] text-[var(--purple-dark)]";
}

function selectedRowClass(status: string) {
  const rows: Record<string, string> = {
    new: "bg-[#f7fbff]",
    pending: "bg-[#fffaf3]",
    preparing: "bg-[#fffaf3]",
    delivering: "bg-[#f7fbff]",
    delivered: "bg-[#f5fff9]",
    completed: "bg-[#f5fff9]",

    problem: "bg-[#fff7f8]",
    returned: "bg-[#fff7f8]",
    cancelled: "bg-[#f8f8fb]",
  };

  return rows[status] ?? "bg-[#fbf9ff]";
}

function selectedRadioClass(status: string) {
  const tones: Record<string, string> = {
    new: "text-[#1377d7]",
    pending: "text-[#f97316]",
    preparing: "text-[#f97316]",
    delivering: "text-[#2563eb]",
    delivered: "text-[#16a34a]",
    completed: "text-[#16a34a]",

    problem: "text-[#ef2f43]",
    returned: "text-[#ef2f43]",
    cancelled: "text-[#4b5563]",
  };

  return tones[status] ?? "text-[var(--purple-dark)]";
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="translate-y-5 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-5 opacity-0"
  >
    <div
      v-if="open"
      class="fixed inset-0 z-[60] flex items-end justify-center bg-[rgba(15,23,42,0.18)]"
      role="presentation"
      @click.self="emit('close')"
    >
      <section
        class="w-[min(100%,430px)] rounded-t-[28px] bg-white px-[17px] pb-[calc(18px_+_env(safe-area-inset-bottom))] pt-[12px] shadow-[0_-18px_50px_rgba(15,23,42,0.16)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="move-order-title"
      >
        <span
          class="mx-auto mb-[16px] block h-[5px] w-[52px] rounded-full bg-[#d8dbe3]"
          aria-hidden="true"
        />

        <h2
          id="move-order-title"
          class="m-0 mb-[14px] text-center text-[16px] font-bold leading-tight tracking-[-0.35px] text-[var(--text)]"
        >
          Move order to
        </h2>

        <div
          class="overflow-hidden rounded-[18px] border border-[var(--line)] bg-white"
        >
          <button
            v-for="(option, index) in statusOptions"
            :key="option.key"
            class="flex min-h-[54px] w-full items-center justify-between gap-[14px] px-[14px] text-[14px] font-semibold leading-none tracking-[-0.35px] transition active:scale-[0.99]"
            :class="[
              index > 0 ? 'border-t border-[var(--line)]' : '',
              isSelected(option.key)
                ? selectedRowClass(option.key)
                : 'bg-white',
            ]"
            type="button"
            @click="emit('select', option.key)"
          >
            <span class="inline-flex min-w-0 items-center gap-[14px]">
              <span
                class="grid h-[34px] w-[34px] flex-none place-items-center rounded-full"
                :class="statusIconClass(option.key)"
              >
                <AppIcon :name="option.icon" :size="20" />
              </span>

              <span class="truncate text-[var(--text)]">
                {{ option.label }}
              </span>
            </span>

            <AppIcon
              :name="
                isSelected(option.key) ? 'radio_checked' : 'radio_unchecked'
              "
              :size="18"
              :class="
                isSelected(option.key)
                  ? selectedRadioClass(option.key)
                  : 'text-[var(--muted)]'
              "
            />
          </button>
        </div>

        <button
          class="mt-[14px] min-h-[52px] w-full rounded-2xl bg-[#f7f7fb] text-[15px] font-extrabold leading-none tracking-[-0.25px] text-[var(--text)]"
          type="button"
          @click="emit('close')"
        >
          Cancel
        </button>
      </section>
    </div>
  </Transition>
</template>
