<script lang="ts">
import type { CSSProperties } from 'vue'
</script>

<script setup lang="ts">
import { computed, warn } from 'vue'

export type ZFlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
export type ZFlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
export type ZFlexPlace = ZFlexJustify | ZFlexAlign | `${ZFlexJustify} ${ZFlexAlign}`

export interface ZFlexProps {
  /** 纵向排列 */
  column?: boolean
  /** 间距；数字的单位是 rem，字符串原样作为 CSS 的 `gap` */
  gap?: number | string
  /**
   * 对齐方式，写作 `'<主轴> <交叉轴>'`，如 `'between center'`，中间的空格数量不限。
   * 只写一个值时：`between` / `around` / `evenly` 只作用于主轴，`stretch` / `baseline` 只作用于交叉轴，其余两个轴都生效。
   * 无法识别的值在开发环境提示一次，并且不产生样式。
   */
  place?: ZFlexPlace
}

const { column = false, gap, place } = defineProps<ZFlexProps>()

defineSlots<{
  default?: () => unknown
}>()

const justifyContent: Record<ZFlexJustify, CSSProperties['justifyContent']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
}

const alignItems: Record<ZFlexAlign, CSSProperties['alignItems']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
}

const justifyOnly = new Set<string>(['between', 'around', 'evenly'])
const alignOnly = new Set<string>(['stretch', 'baseline'])
const justifyNames = new Set(Object.keys(justifyContent))
const alignNames = new Set(Object.keys(alignItems))

interface ParsedPlace {
  cross?: ZFlexAlign
  main: ZFlexJustify | ZFlexAlign
}

// place 可能来自外部配置，空格数量、首尾空白都放宽，只拒绝无法识别的名称。
function parsePlace(value: string): ParsedPlace | null {
  const [main, cross, ...rest] = value.trim().split(/\s+/)
  if (rest.length > 0) {
    return null
  }
  if (cross === undefined) {
    if (justifyNames.has(main) || alignNames.has(main)) {
      return { main: main as ZFlexJustify | ZFlexAlign }
    }
    return null
  }
  if (justifyNames.has(main) && alignNames.has(cross)) {
    return { main: main as ZFlexJustify, cross: cross as ZFlexAlign }
  }
  return null
}

function placeStyle({ main, cross }: ParsedPlace): CSSProperties {
  if (cross) {
    return { justifyContent: justifyContent[main as ZFlexJustify], alignItems: alignItems[cross] }
  }
  if (justifyOnly.has(main)) {
    return { justifyContent: justifyContent[main as ZFlexJustify] }
  }
  if (alignOnly.has(main)) {
    return { alignItems: alignItems[main as ZFlexAlign] }
  }
  return { justifyContent: justifyContent[main as ZFlexJustify], alignItems: alignItems[main as ZFlexAlign] }
}

// 同一个非法值可能出现在很多实例上，只提示一次，避免刷屏。
const warnedPlaces = new Set<string>()
function warnInvalidPlace(value: string) {
  if (warnedPlaces.has(value)) {
    return
  }
  warnedPlaces.add(value)
  warn(`[ZFlex] 无法识别的 place: ${JSON.stringify(value)}，可用值见 ZFlexPlace，例如 'between center'。`)
}

const resolvedPlace = computed(() => {
  if (!place) {
    return null
  }
  // 值可能来自外部配置，不是字符串时也走同一条路径，避免直接调用字符串方法报错。
  const raw = String(place)
  const parsed = parsePlace(raw)
  if (!parsed) {
    warnInvalidPlace(raw)
  }
  return parsed
})

const style = computed<CSSProperties>(() => ({
  gap: typeof gap === 'number'
    ? `${gap}rem`
    : gap,
  ...(resolvedPlace.value
    ? placeStyle(resolvedPlace.value)
    : {}),
}))
</script>

<template>
  <div class="z-flex" :class="{ 'z-flex--column': column }" :style="style">
    <slot />
  </div>
</template>

<style>
.z-flex {
  display: flex;
}

.z-flex--column {
  flex-direction: column;
}
</style>
