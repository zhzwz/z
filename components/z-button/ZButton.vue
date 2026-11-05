<script setup lang="ts">
export interface ZButtonProps {
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const { type = 'button', disabled = false } = defineProps<ZButtonProps>()

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

defineSlots<{
  default?: () => unknown
}>()
</script>

<template>
  <button
    class="z-button"
    :disabled="disabled"
    :type="type"
    @click="emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style>
.z-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5em 1em;
  border: 1px solid currentcolor;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.z-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
