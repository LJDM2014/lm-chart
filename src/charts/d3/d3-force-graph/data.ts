/** 开源技术栈关系网络演示数据 */
export interface TechNodeDatum {
  id: string
  group: number
  size: number
}

export interface TechLinkDatum {
  source: string
  target: string
}

export const techCategories = [
  { name: '语言' },
  { name: '框架' },
  { name: '工具' },
  { name: '领域' },
]

export const techNodes: TechNodeDatum[] = [
  { id: 'TypeScript', group: 0, size: 15 },
  { id: 'Python', group: 0, size: 15 },
  { id: 'Rust', group: 0, size: 12 },
  { id: 'Go', group: 0, size: 12 },
  { id: 'Vue', group: 1, size: 13 },
  { id: 'React', group: 1, size: 14 },
  { id: 'Django', group: 1, size: 9 },
  { id: 'Tauri', group: 1, size: 8 },
  { id: 'Vite', group: 2, size: 12 },
  { id: 'ESLint', group: 2, size: 8 },
  { id: 'Pinia', group: 2, size: 7 },
  { id: 'Docker', group: 2, size: 10 },
  { id: '可视化', group: 3, size: 11 },
  { id: 'AI 应用', group: 3, size: 12 },
  { id: '云原生', group: 3, size: 10 },
  { id: '低代码', group: 3, size: 8 },
]

export const techLinks: TechLinkDatum[] = [
  { source: 'TypeScript', target: 'Vue' },
  { source: 'TypeScript', target: 'React' },
  { source: 'TypeScript', target: 'Vite' },
  { source: 'TypeScript', target: 'Pinia' },
  { source: 'TypeScript', target: '可视化' },
  { source: 'Python', target: 'Django' },
  { source: 'Python', target: 'AI 应用' },
  { source: 'Rust', target: 'Tauri' },
  { source: 'Rust', target: 'Vite' },
  { source: 'Go', target: 'Docker' },
  { source: 'Go', target: '云原生' },
  { source: 'Vue', target: 'Pinia' },
  { source: 'Vue', target: 'Vite' },
  { source: 'Vue', target: '低代码' },
  { source: 'React', target: 'Vite' },
  { source: 'React', target: '低代码' },
  { source: 'Vite', target: 'ESLint' },
  { source: 'Docker', target: '云原生' },
  { source: 'AI 应用', target: '可视化' },
  { source: '可视化', target: '低代码' },
]
