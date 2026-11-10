<script setup lang="ts">
import type { ZAccentName } from '../accent'
import { onMounted, onUnmounted, ref } from 'vue'
import { readZAccent, setZAccent, zAccentDefault, zAccentHex, zAccents } from '../accent'
import ZFlex from '../z-flex/ZFlex.vue'
import ZnButton from '../zn-button/ZnButton.vue'

/** 不接收参数。点色块改 `<html data-z-accent>`，整页强调色跟着变 */
export interface ZnAccentPanelProps {}

defineProps<ZnAccentPanelProps>()

const emit = defineEmits<{
  /** 选中一个色块时触发，参数是颜色名 */
  pick: [name: ZAccentName]
}>()

const accents = Object.keys(zAccents) as ZAccentName[]
const current = ref<ZAccentName>(zAccentDefault)
let observer: MutationObserver | undefined

function sync() {
  current.value = readZAccent() ?? zAccentDefault
}

function pick(name: ZAccentName) {
  setZAccent(name)
  emit('pick', name)
}

onMounted(() => {
  sync()
  observer = new MutationObserver(sync)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-z-accent'],
  })
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<template>
  <ZFlex aria-label="强调色" :gap="0.5" place="center" role="group">
    <ZnButton
      v-for="accent in accents"
      :key="accent"
      :aria-label="accent"
      :aria-pressed="current === accent"
      circle
      :color="zAccentHex(accent, 500)"
      size="small"
      @click="pick(accent)"
    >
      <template v-if="current === accent" #icon>✓</template>
    </ZnButton>
  </ZFlex>
</template>
