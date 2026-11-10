<!-- icon 与 label 两个 prop，只有图标时必须给可访问名称 -->
<script setup lang="ts">
import { ZnButton } from '@zhzwz/z/components/zn-button'
import { ZnConfigProvider } from '@zhzwz/z/components/zn-config-provider'
</script>

<template>
  <ZnConfigProvider>
    <div class="row">
      <ZnButton icon="ic:round-add" label="新建" type="primary" />
      <ZnButton icon="ic:round-delete" label="删除" />
      <ZnButton icon="ic:round-settings" label="设置" />
    </div>
    <div class="row">
      <ZnButton aria-label="搜索" circle icon="ic:round-search" type="primary" />
      <ZnButton aria-label="刷新" circle icon="ic:round-refresh" />
      <ZnButton aria-label="更多" circle icon="ic:round-more-horiz" />
    </div>
  </ZnConfigProvider>
</template>
