<!-- 指定滚动条粗细 -->
<template>
  <ZnConfigProvider>
    <ZnScrollbar class="scroll-box panel" :size="8">
      <p v-for="index in 12" :key="index">
        第 {{ index }} 行
      </p>
    </ZnScrollbar>
  </ZnConfigProvider>
</template>
