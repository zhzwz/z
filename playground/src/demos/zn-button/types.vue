<!-- 主题色与朴素按钮 -->
<template>
  <ZnConfigProvider>
    <div class="row">
      <ZnButton>默认</ZnButton>
      <ZnButton type="primary">
        主要
      </ZnButton>
      <ZnButton type="info">
        信息
      </ZnButton>
      <ZnButton type="success">
        成功
      </ZnButton>
      <ZnButton type="warning">
        警告
      </ZnButton>
      <ZnButton type="error">
        错误
      </ZnButton>
    </div>
    <div class="row">
      <ZnButton secondary>
        次要
      </ZnButton>
      <ZnButton dashed>
        虚线
      </ZnButton>
      <ZnButton text>
        文字
      </ZnButton>
      <ZnButton quaternary>
        淡色
      </ZnButton>
      <ZnButton disabled>
        禁用
      </ZnButton>
    </div>
  </ZnConfigProvider>
</template>
