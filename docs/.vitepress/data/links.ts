// Link interface
export interface Link {
  name: string
  url: string
  avatar: string
  desc: string
  color?: string
}

// Link category interface
export interface LinkCategory {
  name: string
  links: Link[]
}

// 友链数据
export const linkCategories: LinkCategory[] = [
  {
    name: '技术博客',
    links: [
      // 示例友链，请替换为真实数据
      {
        name: '待添加',
        url: '#',
        avatar: '/logo.svg',
        desc: '等待添加友链...',
        color: '#7c3aed'
      }
    ]
  },
  {
    name: '个人站点',
    links: [
      {
        name: '待添加',
        url: '#',
        avatar: '/logo.svg',
        desc: '等待添加友链...',
        color: '#3b82f6'
      }
    ]
  }
]

// 本站信息（供他人添加友链时使用）
export const mySiteInfo: Link = {
  name: '码出意境 | Code Context',
  url: 'https://hk-hub.github.io/code-context',
  avatar: '/logo.svg',
  desc: '技术博客与开源文档站，专注于后端、AI、全栈领域技术分享',
  color: '#7c3aed'
}