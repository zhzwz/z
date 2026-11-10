<!-- 多行文本 -->
<script setup lang="ts">
import { ref } from 'vue'

const note = ref<string | null>(null)
</script>

<template>
  <ZnConfigProvider>
    <div class="stack panel">
      <ZnTextarea v-model="note" placeholder="备注" />
      <p class="note">
        值：{{ note === null ? 'null' : JSON.stringify(note) }}
      </p>
    </div>
  </ZnConfigProvider>
</template>
