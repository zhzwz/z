import type { Ref } from 'vue'
import { computed, watch } from 'vue'

/**
 * 界面看到的就是会提交的数据：model 收到无法如实显示的值时，立即回写为界面上显示的值。
 *
 * `toDisplayed` 把任意值转成界面显示的值；值本身合法时必须原样返回（数组也要返回同一个引用），否则会反复回写。
 */
export function useDisplayedModel<T>(model: Ref<T>, toDisplayed: (value: unknown) => T) {
  const displayed = computed(() => toDisplayed(model.value))
  watch([model, displayed], ([value, shown]) => {
    if (!Object.is(value, shown)) {
      model.value = shown
    }
  }, { immediate: true })
  return displayed
}
