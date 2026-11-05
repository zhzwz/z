<!-- 点击计数，事件带原生 MouseEvent -->
<script setup lang="ts">
import { ZButton } from '@zhzwz/z/components/z-button'
import { ref } from 'vue'

const count = ref(0)
const lastEvent = ref('')

function handleClick(event: MouseEvent) {
  count.value++
  lastEvent.value = event.type
}
</script>

<template>
  <div class="row">
    <ZButton @click="handleClick">
      点击 {{ count }} 次
    </ZButton>
    <ZButton disabled>
      禁用
    </ZButton>
    <span v-if="lastEvent" class="muted">最近一次事件：{{ lastEvent }}</span>
  </div>
</template>
