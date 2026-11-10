<!-- 点击后进入加载状态 -->
<script setup lang="ts">
import { ref } from 'vue'

const loading = ref(false)

function start() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
}
</script>

<template>
  <ZnConfigProvider>
    <div class="row">
      <ZnButton :loading="loading" type="primary" @click="start">
        加载 1 秒
      </ZnButton>
      <ZnButton loading type="primary">
        一直加载
      </ZnButton>
    </div>
  </ZnConfigProvider>
</template>
