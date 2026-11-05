<!-- 默认 type 是 button，放进表单不会意外提交 -->
<script setup lang="ts">
import { ZButton } from '@zhzwz/z/components/z-button'
import { ref } from 'vue'

const submitted = ref(0)
</script>

<template>
  <form class="row" @submit.prevent="submitted++">
    <ZButton type="submit">
      提交表单
    </ZButton>
    <span>已提交 {{ submitted }} 次</span>
  </form>
</template>
