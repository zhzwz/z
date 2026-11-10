<!-- 间距与对齐 -->
<template>
  <div class="stack panel">
    <ZFlex gap="12px" place="between center">
      <span>起点</span>
      <span>两端对齐</span>
    </ZFlex>
    <ZFlex :gap="0.5" place="center">
      <span>居中</span>
      <span>间距 0.5rem</span>
    </ZFlex>
  </div>
</template>
