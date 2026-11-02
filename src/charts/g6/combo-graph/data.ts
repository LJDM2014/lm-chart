/** 开源技术生态演示数据：节点按领域归入三个 Combo 分组 */
export interface EcosystemNode {
  id: string
  /** 分组序号（映射主题色板） */
  group: number
  /** 所属 Combo */
  combo: string
}

export interface EcosystemEdge {
  source: string
  target: string
}

export const ecosystemNodes: EcosystemNode[] = [
  { id: 'Vite', group: 0, combo: '前端框架' },
  { id: 'Vue', group: 0, combo: '前端框架' },
  { id: 'React', group: 0, combo: '前端框架' },
  { id: 'Svelte', group: 0, combo: '前端框架' },
  { id: 'Node.js', group: 1, combo: '服务端' },
  { id: 'Deno', group: 1, combo: '服务端' },
  { id: 'Bun', group: 1, combo: '服务端' },
  { id: 'Go', group: 1, combo: '服务端' },
  { id: 'Java', group: 1, combo: '服务端' },
  { id: 'Python', group: 2, combo: '数据与算法' },
  { id: 'Rust', group: 2, combo: '数据与算法' },
  { id: 'WebAssembly', group: 2, combo: '数据与算法' },
  { id: 'TensorFlow', group: 2, combo: '数据与算法' },
  { id: 'CUDA', group: 2, combo: '数据与算法' },
]

export const ecosystemEdges: EcosystemEdge[] = [
  { source: 'Vite', target: 'Vue' },
  { source: 'Vite', target: 'React' },
  { source: 'Vite', target: 'Svelte' },
  { source: 'Node.js', target: 'Vite' },
  { source: 'Node.js', target: 'Vue' },
  { source: 'Node.js', target: 'React' },
  { source: 'Deno', target: 'Node.js' },
  { source: 'Bun', target: 'Node.js' },
  { source: 'Go', target: 'Node.js' },
  { source: 'Java', target: 'Node.js' },
  { source: 'Python', target: 'TensorFlow' },
  { source: 'Python', target: 'Node.js' },
  { source: 'Rust', target: 'WebAssembly' },
  { source: 'Rust', target: 'Bun' },
  { source: 'Rust', target: 'Deno' },
  { source: 'WebAssembly', target: 'React' },
  { source: 'CUDA', target: 'TensorFlow' },
  { source: 'Go', target: 'CUDA' },
  { source: 'Java', target: 'TensorFlow' },
]

/** Combo 列表（按节点出现顺序去重） */
export const ecosystemCombos: string[] = [...new Set(ecosystemNodes.map((n) => n.combo))]
