<script setup lang="ts">
import { ref } from 'vue'
import { ZButton } from '../components/z-button/index.ts'
import { ZIcon } from '../components/z-icon/index.ts'
import { ZnButton } from '../components/zn-button/index.ts'
import { version } from '../index.ts'

const clickCount = ref(0)
const submitCount = ref(0)
const znClickCount = ref(0)
const loading = ref(false)

function startLoading() {
  loading.value = true
  setTimeout(() => loading.value = false, 1000)
}
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

    <section>
      <h2>ZnButton</h2>

      <div class="demo">
        <ZnButton @click="znClickCount++">点击次数：{{ znClickCount }}</ZnButton>
        <ZnButton type="primary">主要</ZnButton>
        <ZnButton secondary type="success">次要</ZnButton>
        <ZnButton dashed>虚线</ZnButton>
        <ZnButton disabled>禁用</ZnButton>
      </div>

      <div class="demo">
        <ZnButton :loading="loading" type="primary" @click="startLoading">加载 1 秒</ZnButton>
        <ZnButton round type="info">
          <template #icon>
            <span>★</span>
          </template>
          图标插槽
        </ZnButton>
      </div>

      <div class="demo">
        <ZnButton icon="ic:round-add" label="新建" type="primary" />
        <ZnButton icon="ic:round-delete" label="删除" />
        <ZnButton aria-label="搜索" icon="ic:round-search" type="primary" />
        <ZnButton aria-label="设置" icon="ic:round-settings" />
        <ZnButton aria-label="收藏" icon="ic:round-favorite" size="small" />
        <ZnButton aria-label="收藏" icon="ic:round-favorite" size="large" type="error" />
        <ZnButton aria-label="收藏" circle icon="ic:round-favorite" type="primary" />
      </div>
    </section>

    <section>
      <h2>ZIcon</h2>

      <div class="demo icons">
        <ZIcon icon="ic:round-home" />
        <ZIcon icon="ic:round-search" />
        <ZIcon icon="mdi:github" />
        <ZIcon aria-label="收藏" color="#d03050" icon="ic:round-favorite" />
      </div>
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

.icons {
  font-size: 24px;
}
</style>
