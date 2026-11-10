<!-- 下拉单选，选项可以带图标 -->
<script setup lang="ts">
import type { ZnSelectOption } from '@zhzwz/z/components/zn-select'
import { ref } from 'vue'

const value = ref<string | null>(null)
const options: ZnSelectOption[] = [
  { label: '阅读', value: 'read', icon: 'ic:round-menu-book' },
  { label: '写入', value: 'write', icon: 'ic:round-edit' },
]
</script>

<template>
  <ZnConfigProvider>
    <div class="stack panel">
      <ZnSelect v-model="value" :options="options" />
      <p class="note">
        值：{{ value === null ? 'null' : value }}
      </p>
    </div>
  </ZnConfigProvider>
</template>
