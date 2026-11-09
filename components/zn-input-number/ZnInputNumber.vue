<script lang="ts">
import type { InputNumberInst, InputNumberSlots } from 'naive-ui'
import type { ExtractPublicPropTypes } from 'vue'
import { inputNumberProps, NInputNumber } from 'naive-ui'
import { useTemplateRef } from 'vue'
import { forwardMethods } from '../../shared/expose'
import { useDisplayedModel } from '../../shared/model'
import { omit } from '../../shared/omit'
import { inputNumberRemovedProps } from '../removed-props'
import { useZnDefaults } from '../zn-config-provider/config'

export const znInputNumberProps = omit(inputNumberProps, inputNumberRemovedProps)

export type ZnInputNumberProps = ExtractPublicPropTypes<typeof znInputNumberProps>

function toNumberValue(value: unknown) {
  const number = typeof value === 'string' && value.trim() !== ''
    ? Number(value)
    : value
  return typeof number === 'number' && Number.isFinite(number)
    ? number
    : null
}
</script>

<script setup lang="ts">
const props = defineProps(znInputNumberProps)
const slots = defineSlots<InputNumberSlots>()
const resolvedProps = useZnDefaults('ZnInputNumber', props, znInputNumberProps)
const model = defineModel<number | null>({ default: null })
const value = useDisplayedModel(model, toNumberValue)

const slotNames = () => Object.keys(slots) as (keyof InputNumberSlots)[]

const inputNumber = useTemplateRef<InputNumberInst>('inputNumber')
defineExpose(forwardMethods(inputNumber, ['focus', 'blur', 'select']))
</script>

<template>
  <NInputNumber ref="inputNumber" v-bind="resolvedProps()" :value="value" @update:value="model = $event">
    <template v-for="name in slotNames()" #[name]>
      <slot :name="name" />
    </template>
  </NInputNumber>
</template>
