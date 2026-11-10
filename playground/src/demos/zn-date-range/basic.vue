<!-- 起止是两个字段 -->
<script setup lang="ts">
import { ref } from 'vue'

const start = ref<string | null>('2024-01-01')
const end = ref<string | null>('2024-01-07')
</script>

<template>
  <ZnConfigProvider>
    <div class="stack panel">
      <ZnDateRange v-model:end="end" v-model:start="start" />
      <p class="note">
        开始：{{ start === null ? 'null' : start }}，结束：{{ end === null ? 'null' : end }}
      </p>
    </div>
  </ZnConfigProvider>
</template>
