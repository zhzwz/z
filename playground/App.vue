<script setup lang="ts">
import { ref } from 'vue'
import { version, ZButton } from '../index.ts'

const clickCount = ref(0)
const submitCount = ref(0)
</script>

<template>
  <main class="playground">
    <header>
      <h1>@zhzwz/z</h1>
      <p class="version">v{{ version }}</p>
    </header>

    <section>
      <h2>ZButton</h2>

      <div class="demo">
        <ZButton @click="clickCount++">点击次数：{{ clickCount }}</ZButton>
        <ZButton disabled @click="clickCount++">禁用</ZButton>
      </div>

      <form class="demo" @submit.prevent="submitCount++">
        <ZButton type="submit">提交表单</ZButton>
        <span>提交次数：{{ submitCount }}</span>
      </form>
    </section>
  </main>
</template>

<style>
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2328;
}

.playground {
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 24px;
}

.version {
  color: #656d76;
}

.demo {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}
</style>
