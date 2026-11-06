<script setup lang="ts">
import type { ZFlexProps } from '../z-flex'
import { ZFlex } from '../z-flex'

export type ZFlexColProps = Omit<ZFlexProps, 'column'>

const props = defineProps<ZFlexColProps>()

defineSlots<{
  default?: () => unknown
}>()
</script>

<template>
  <ZFlex v-bind="props" column>
    <slot />
  </ZFlex>
</template>
