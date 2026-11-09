<!-- schema 渲染同样的字段，外面调用 submit() -->
<script setup lang="ts">
import type { ZnFormData, ZnFormSchema } from '@zhzwz/z/components/zn-form'
import { ZnButton } from '@zhzwz/z/components/zn-button'
import { ZnConfigProvider } from '@zhzwz/z/components/zn-config-provider'
import { ZnForm } from '@zhzwz/z/components/zn-form'
import { ref, useTemplateRef } from 'vue'
import NaiveTheme from '@/components/NaiveTheme.vue'

const form = useTemplateRef('form')
const data = ref<Record<string, unknown>>({
  name: '',
  start: null,
  end: null,
})
const result = ref('')

const schema: ZnFormSchema = {
  cols: 2,
  fields: [
    {
      component: 'ZnInput',
      path: 'name',
      label: '名称',
      required: true,
    },
    {
      component: 'ZnDateRange',
      path: { start: 'start', end: 'end' },
      label: '有效期',
      required: true,
    },
  ],
}

function save(copy: ZnFormData) {
  result.value = JSON.stringify(copy)
}
</script>

<template>
  <ZnConfigProvider>
    <NaiveTheme>
      <div class="stack panel">
        <ZnForm ref="form" v-model="data" :schema="schema" @submit="save" />
        <ZnButton type="primary" @click="form?.submit()">
          提交
        </ZnButton>
        <p v-if="result" class="note">
          {{ result }}
        </p>
      </div>
    </NaiveTheme>
  </ZnConfigProvider>
</template>
