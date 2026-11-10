<!-- 字段的默认值、说明和占列 -->
<script setup lang="ts">
import type { ZnFormSchema } from '@zhzwz/z/components/zn-form'
import { ZnConfigProvider } from '@zhzwz/z/components/zn-config-provider'
import { ZnForm } from '@zhzwz/z/components/zn-form'
import { ref } from 'vue'

const data = ref<Record<string, unknown>>({})

const schema: ZnFormSchema = {
  cols: 2,
  fields: [
    {
      component: 'ZnInput',
      path: 'name',
      label: '名称',
      help: '为空时填入默认值',
      defaultValue: '未命名',
      required: true,
    },
    {
      component: 'ZnInputNumber',
      path: 'count',
      label: '数量',
    },
    {
      component: 'ZnTextarea',
      path: 'note',
      label: '备注',
      span: 2,
    },
  ],
}
</script>

<template>
  <ZnConfigProvider>
    <ZnForm v-model="data" class="panel" :schema="schema" />
    <p class="note">
      {{ JSON.stringify(data) }}
    </p>
  </ZnConfigProvider>
</template>
