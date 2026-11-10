<script setup lang="ts">
import { NPopover } from 'naive-ui'
import { onUnmounted, ref, watch } from 'vue'
import ZnAccentPanel from '../zn-accent-panel/ZnAccentPanel.vue'
import ZnButton from '../zn-button/ZnButton.vue'

/** 不接收参数。点调色盘打开 `ZnAccentPanel`，选中色块后改 `<html data-z-accent>` */
export interface ZnAccentSwitchProps {}

defineProps<ZnAccentSwitchProps>()

const open = ref(false)

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    open.value = false
  }
}

watch(open, (value) => {
  if (value) {
    document.addEventListener('keydown', onKeydown)
  } else {
    document.removeEventListener('keydown', onKeydown)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <NPopover v-model:show="open" :animated="false" placement="bottom-end" trigger="click">
    <template #trigger>
      <ZnButton :aria-expanded="open" aria-label="强调色" circle quaternary>
        <template #icon>
          <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
            <path
              d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.8"
            />
            <circle cx="13.5" cy="6.5" fill="currentColor" r="1" />
            <circle cx="17.5" cy="10.5" fill="currentColor" r="1" />
            <circle cx="6.5" cy="12.5" fill="currentColor" r="1" />
            <circle cx="8.5" cy="7.5" fill="currentColor" r="1" />
          </svg>
        </template>
      </ZnButton>
    </template>
    <ZnAccentPanel @pick="open = false" />
  </NPopover>
</template>
