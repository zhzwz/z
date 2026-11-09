<script lang="ts">
import type { InputInst, InputSlots } from 'naive-ui'
import type { ExtractPublicPropTypes } from 'vue'
import { inputProps, NInput } from 'naive-ui'
import { useTemplateRef } from 'vue'
import { forwardMethods } from '../../shared/expose'
import { useDisplayedModel } from '../../shared/model'
import { omit } from '../../shared/omit'
import { toTextValue } from '../../shared/text'
import { textareaRemovedProps } from '../removed-props'
import { useZnDefaults } from '../zn-config-provider/config'

export const znTextareaProps = omit(inputProps, textareaRemovedProps)

export type ZnTextareaProps = ExtractPublicPropTypes<typeof znTextareaProps>
</script>

<script setup lang="ts">
const props = defineProps(znTextareaProps)
const slots = defineSlots<InputSlots>()
const resolvedProps = useZnDefaults('ZnTextarea', props, znTextareaProps)
const model = defineModel<string | null>({ default: null })
const value = useDisplayedModel(model, toTextValue)

const slotNames = () => Object.keys(slots) as (keyof InputSlots)[]

const textarea = useTemplateRef<InputInst>('textarea')
defineExpose(forwardMethods(textarea, [
  'focus',
  'blur',
  'select',
  'clear',
  'activate',
  'deactivate',
  'scrollTo',
]))
</script>

<template>
  <NInput
    ref="textarea"
    v-bind="resolvedProps()"
    type="textarea"
    :value="value"
    @update:value="model = $event || null"
  >
    <!-- 各插槽的参数类型不同，遍历时无法按插槽名收窄 -->
    <template v-for="name in slotNames()" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps as any" />
    </template>
  </NInput>
</template>
