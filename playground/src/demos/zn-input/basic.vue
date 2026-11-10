<!-- 单行文本，清空后写成 null -->
<script setup lang="ts">
import { ref } from 'vue'

const name = ref<string | null>('示例')
const password = ref<string | null>(null)
</script>

<template>
  <ZnConfigProvider>
    <div class="stack panel">
      <ZnInput v-model="name" placeholder="姓名" />
      <ZnInput v-model="password" placeholder="密码" type="password" />
      <p class="note">
        姓名：{{ name === null ? 'null' : JSON.stringify(name) }}，密码：{{ password === null ? 'null' : '已填写' }}
      </p>
    </div>
  </ZnConfigProvider>
</template>
