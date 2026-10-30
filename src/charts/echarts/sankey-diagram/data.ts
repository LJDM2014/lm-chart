/** 能源流向演示数据 */
export interface SankeyNode {
  name: string
}

export interface SankeyLink {
  source: string
  target: string
  value: number
}

export const nodes: SankeyNode[] = [
  { name: '原煤' },
  { name: '原油' },
  { name: '天然气' },
  { name: '水电' },
  { name: '核电' },
  { name: '火电' },
  { name: '工业用电' },
  { name: '居民用电' },
  { name: '商业用电' },
]

export const links: SankeyLink[] = [
  { source: '原煤', target: '火电', value: 320 },
  { source: '原油', target: '火电', value: 120 },
  { source: '天然气', target: '火电', value: 160 },
  { source: '水电', target: '火电', value: 100 },
  { source: '核电', target: '火电', value: 80 },
  { source: '火电', target: '工业用电', value: 380 },
  { source: '火电', target: '居民用电', value: 240 },
  { source: '火电', target: '商业用电', value: 160 },
]
