<script lang="ts">
import type { ScrollbarInst } from 'naive-ui'
import type { ExtractPublicPropTypes, VNodeChild } from 'vue'
import { NScrollbar, scrollbarProps } from 'naive-ui'
import { useTemplateRef } from 'vue'
import { forwardMethods } from '../../shared/expose'
import { useZnDefaults } from '../zn-config-provider/config'

export const znScrollbarProps = {
  ...scrollbarProps,
  /** 滚动条粗细，单位 px；优先于 `themeOverrides` 里的 `width` / `height` */
  size: Number,
} as const

export type ZnScrollbarProps = ExtractPublicPropTypes<typeof znScrollbarProps>
</script>

<script setup lang="ts">
const props = defineProps(znScrollbarProps)
defineSlots<{ default?: () => VNodeChild }>()
const resolvedProps = useZnDefaults('ZnScrollbar', props, znScrollbarProps)

function nScrollbarProps() {
  const { size, ...rest } = resolvedProps()
  if (size === undefined) {
    return rest
  }
  // 复制一份再覆盖宽度：不改使用方传进来的 themeOverrides 对象。
  return {
    ...rest,
    themeOverrides: { ...rest.themeOverrides, width: `${size}px`, height: `${size}px` },
  }
}

const scrollbar = useTemplateRef<ScrollbarInst>('scrollbar')
defineExpose(forwardMethods(scrollbar, ['scrollTo', 'scrollBy']))
</script>

<template>
  <NScrollbar ref="scrollbar" v-bind="nScrollbarProps()">
    <slot />
  </NScrollbar>
</template>
