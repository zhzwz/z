<!-- 尺寸、圆形和块级 -->
<template>
  <ZnConfigProvider>
    <div class="row">
      <ZnButton size="tiny">
        极小
      </ZnButton>
      <ZnButton size="small">
        小
      </ZnButton>
      <ZnButton size="medium">
        中
      </ZnButton>
      <ZnButton size="large">
        大
      </ZnButton>
    </div>
    <div class="row">
      <ZnButton aria-label="收藏" circle icon="ic:round-favorite" />
      <ZnButton round>
        圆角
      </ZnButton>
      <ZnButton secondary strong type="primary">
        加粗
      </ZnButton>
    </div>
    <div class="row">
      <ZnButton block type="primary">
        块级按钮
      </ZnButton>
    </div>
  </ZnConfigProvider>
</template>
