<!-- 起止是两个字段 -->
<script setup lang="ts">
import { ZnConfigProvider } from '@zhzwz/z/components/zn-config-provider'
import { ZnDateRange } from '@zhzwz/z/components/zn-date-range'
import { ref } from 'vue'
import NaiveTheme from '@/components/NaiveTheme.vue'

const start = ref<string | null>('2024-01-01')
const end = ref<string | null>('2024-01-07')
</script>

<template>
  <ZnConfigProvider>
    <NaiveTheme>
      <div class="stack panel">
        <ZnDateRange v-model:end="end" v-model:start="start" />
        <p class="note">
          开始：{{ start === null ? 'null' : start }}，结束：{{ end === null ? 'null' : end }}
        </p>
      </div>
    </NaiveTheme>
  </ZnConfigProvider>
</template>
