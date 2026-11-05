<script setup lang="ts">
import type { IconifyIcon } from '@iconify/vue'
import type { Component } from 'vue'
import { Icon } from '@iconify/vue'
import { computed, toRaw, useAttrs } from 'vue'

export interface ZIconProps {
  /** iconify 图标名（如 `ic:round-add`）、iconify 图标数据，或图标组件；为空时不渲染 */
  icon?: string | IconifyIcon | Component | null
}

const props = defineProps<ZIconProps>()

const iconify = computed(() => {
  const { icon } = props
  if (typeof icon === 'string' || (icon && 'body' in icon)) {
    return icon as string | IconifyIcon
  }
  return null
})

// 图标组件可能随配置对象一起被转成响应式代理（如放在 ref 里的选项），渲染前取回原始组件。
const component = computed(() => (iconify.value || !props.icon
  ? null
  : toRaw(props.icon)))

// 默认视为装饰性图标，对读屏软件隐藏；传了 aria-label / aria-labelledby 时作为有意义的图片读出。
// attrs 不是响应式对象，在渲染时读取。
const attrs = useAttrs()
const labelled = () => attrs['aria-label'] != null || attrs['aria-labelledby'] != null
</script>

<template>
  <Icon
    v-if="iconify"
    :aria-hidden="labelled() ? 'false' : 'true'"
    class="z-icon"
    :icon="iconify"
  />
  <component
    :is="component"
    v-else-if="component"
    :aria-hidden="labelled() ? undefined : 'true'"
    class="z-icon"
    :role="labelled() ? 'img' : undefined"
  />
</template>

<style>
.z-icon {
  flex-shrink: 0;
}
</style>
