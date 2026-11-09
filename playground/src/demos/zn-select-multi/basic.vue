<!-- 下拉多选，没有选中时是空数组 -->
<script setup lang="ts">
import type { ZnSelectOption } from '@zhzwz/z/components/zn-select'
import { ZnConfigProvider } from '@zhzwz/z/components/zn-config-provider'
import { ZnSelectMulti } from '@zhzwz/z/components/zn-select-multi'
import { ref } from 'vue'
import NaiveTheme from '@/components/NaiveTheme.vue'

const value = ref<string[]>([])
const options: ZnSelectOption[] = [
  { label: '阅读', value: 'read' },
  { label: '写入', value: 'write' },
  { label: '删除', value: 'delete' },
]
</script>

<template>
  <ZnConfigProvider>
    <NaiveTheme>
      <div class="stack panel">
        <ZnSelectMulti v-model="value" :options="options" />
        <p class="note">
          {{ JSON.stringify(value) }}
        </p>
      </div>
    </NaiveTheme>
  </ZnConfigProvider>
</template>
