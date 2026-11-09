export interface NavItem {
  href: string
  order: number
  title: string
}

export interface NavSection {
  items: NavItem[]
  title: string
}

// 目录名到分组标题的映射，未列出的目录直接用目录名。
const sectionTitles: Record<string, string> = {
  '': '概况',
  components: '组件',
}

const sectionOrder = Object.keys(sectionTitles)

function rank(section: string) {
  const index = sectionOrder.indexOf(section)
  return index < 0
    ? sectionOrder.length
    : index
}

/** 内容条目 id 到路由，如 `components/z-flex` 到 `/components/z-flex/`，`index` 到 `/`。 */
export function entryHref(id: string) {
  return id === 'index'
    ? '/'
    : `/${id}/`
}

function toSection(id: string) {
  return id.includes('/')
    ? id.split('/')[0]!
    : ''
}

/** 由内容集合推出侧边栏，新增一个 .mdx 就会出现在导航里。 */
export function navSections(entries: { data: { order: number, title: string }, id: string }[]): NavSection[] {
  const grouped = new Map<string, NavItem[]>()

  for (const entry of entries) {
    const section = toSection(entry.id)
    const items = grouped.get(section) ?? []
    items.push({
      href: entryHref(entry.id),
      order: entry.data.order,
      title: entry.data.title,
    })
    grouped.set(section, items)
  }

  return [...grouped]
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([section, items]) => ({
      items: items.toSorted((a, b) => a.order - b.order || a.title.localeCompare(b.title)),
      title: sectionTitles[section] ?? section,
    }))
}
