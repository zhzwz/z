<!-- 多行文本 -->
<script setup lang="ts">
import { ZnConfigProvider } from '@zhzwz/z/components/zn-config-provider'
import { ZnTextarea } from '@zhzwz/z/components/zn-textarea'
import { ref } from 'vue'
import NaiveTheme from '@/components/NaiveTheme.vue'

const note = ref<string | null>(null)
</script>

<template>
  <ZnConfigProvider>
    <NaiveTheme>
      <div class="stack panel">
        <ZnTextarea v-model="note" placeholder="备注" />
        <p class="note">
          值：{{ note === null ? 'null' : JSON.stringify(note) }}
        </p>
      </div>
    </NaiveTheme>
  </ZnConfigProvider>
</template>
