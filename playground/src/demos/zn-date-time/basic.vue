<!-- 日期时间存成 yyyy-MM-dd HH:mm:ss -->
<script setup lang="ts">
import { ZnConfigProvider } from '@zhzwz/z/components/zn-config-provider'
import { ZnDateTime } from '@zhzwz/z/components/zn-date-time'
import { ref } from 'vue'
import NaiveTheme from '@/components/NaiveTheme.vue'

const when = ref<string | null>('2024-01-01 08:30:00')
</script>

<template>
  <ZnConfigProvider>
    <NaiveTheme>
      <div class="stack panel">
        <ZnDateTime v-model="when" />
        <p class="note">
          值：{{ when === null ? 'null' : when }}
        </p>
      </div>
    </NaiveTheme>
  </ZnConfigProvider>
</template>
