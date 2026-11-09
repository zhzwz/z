<!-- 数字，没有值时是 null -->
<script setup lang="ts">
import { ZnConfigProvider } from '@zhzwz/z/components/zn-config-provider'
import { ZnInputNumber } from '@zhzwz/z/components/zn-input-number'
import { ref } from 'vue'
import NaiveTheme from '@/components/NaiveTheme.vue'

const count = ref<number | null>(1)
</script>

<template>
  <ZnConfigProvider>
    <NaiveTheme>
      <div class="stack panel">
        <ZnInputNumber v-model="count" />
        <p class="note">
          值：{{ count === null ? 'null' : count }}
        </p>
      </div>
    </NaiveTheme>
  </ZnConfigProvider>
</template>
