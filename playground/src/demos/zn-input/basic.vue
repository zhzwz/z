<!-- 单行文本，清空后写成 null -->
<script setup lang="ts">
import { ZnConfigProvider } from '@zhzwz/z/components/zn-config-provider'
import { ZnInput } from '@zhzwz/z/components/zn-input'
import { ref } from 'vue'
import NaiveTheme from '@/components/NaiveTheme.vue'

const name = ref<string | null>('示例')
const password = ref<string | null>(null)
</script>

<template>
  <ZnConfigProvider>
    <NaiveTheme>
      <div class="stack panel">
        <ZnInput v-model="name" placeholder="姓名" />
        <ZnInput v-model="password" placeholder="密码" type="password" />
        <p class="note">
          姓名：{{ name === null ? 'null' : JSON.stringify(name) }}，密码：{{ password === null ? 'null' : '已填写' }}
        </p>
      </div>
    </NaiveTheme>
  </ZnConfigProvider>
</template>
