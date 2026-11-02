/** 前端知识体系思维导图数据（嵌套树结构，经 treeToGraphData 转换后供 G6 使用） */
export interface MindNode {
  id: string
  children?: MindNode[]
}

export const mindTree: MindNode = {
  id: '前端工程',
  children: [
    {
      id: '框架',
      children: [{ id: 'Vue' }, { id: 'React' }, { id: 'Svelte' }],
    },
    {
      id: '构建工具',
      children: [{ id: 'Vite' }, { id: 'esbuild' }, { id: 'Rollup' }],
    },
    {
      id: '语言增强',
      children: [{ id: 'TypeScript' }, { id: 'Sass' }, { id: 'pnpm' }],
    },
    {
      id: '可视化',
      children: [{ id: 'ECharts' }, { id: 'G2' }, { id: 'G6' }, { id: 'D3' }],
    },
  ],
}
