<!-- 日期存成 yyyy-MM-dd -->
<script setup lang="ts">
import { ref } from 'vue'

const day = ref<string | null>('2024-01-01')
</script>

<template>
  <ZnConfigProvider>
    <div class="stack panel">
      <ZnDate v-model="day" />
      <p class="note">
        值：{{ day === null ? 'null' : day }}
      </p>
    </div>
  </ZnConfigProvider>
</template>
