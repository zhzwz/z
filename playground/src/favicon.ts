import faviconSvg from './assets/favicon.svg?raw'

/**
 * 图标只有一份：src/assets/favicon.svg，几何规则写在那里的注释里。
 * src/assets 不会被当成静态资源对外提供，所以注释不会漏出去。
 */

/** 对外提供的 /favicon.svg：保留 <style>（跟随系统配色），去掉注释与多余空白。 */
export function faviconFile() {
  return `${minify(faviconSvg)}\n`
}

/**
 * 页面内使用的 SVG：去掉 <style>，配色交给站点主题变量。
 * favicon 只能跟随系统配色，页面内的图标要跟随站点的主题选择，因此不能共用这段样式。
 * className 注入到 <svg> 上，便于控制尺寸。
 */
export function faviconInline(className: string) {
  const markup = minify(faviconSvg.replace(/<style>[\s\S]*?<\/style>/, ''))
  return markup.replace('<svg ', `<svg class="${className}" `)
}

function minify(svg: string) {
  return svg
    .replace(/<!--[\s\S]*?-->/g, '')
    // 标签之间、样式内外、CSS 语法符号前后的空白都不需要
    .replace(/>\s+</g, '><')
    .replace(/<style>\s*/g, '<style>')
    .replace(/\s*<\/style>/g, '</style>')
    .replace(/\s+/g, ' ')
    .replace(/\{\s*/g, '{')
    .replace(/\s*\}/g, '}')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*:\s*/g, ':')
    .trim()
}
