/** CI/CD 流水线 DAG 演示数据：有向无环图，节点分起止 / 过程两类 */
export interface FlowNode {
  id: string
  label: string
  /** 节点类别：start 起点 / end 终点 / process 过程 */
  kind: 'start' | 'process' | 'end'
}

export interface FlowEdge {
  source: string
  target: string
}

export const flowNodes: FlowNode[] = [
  { id: 'commit', label: '提交代码', kind: 'start' },
  { id: 'lint', label: '代码检查', kind: 'process' },
  { id: 'typecheck', label: '类型检查', kind: 'process' },
  { id: 'build', label: '构建产物', kind: 'process' },
  { id: 'unit', label: '单元测试', kind: 'process' },
  { id: 'scan', label: '安全扫描', kind: 'process' },
  { id: 'integration', label: '集成测试', kind: 'process' },
  { id: 'staging', label: '预发环境', kind: 'process' },
  { id: 'e2e', label: 'E2E 测试', kind: 'process' },
  { id: 'deploy', label: '生产发布', kind: 'end' },
]

export const flowEdges: FlowEdge[] = [
  { source: 'commit', target: 'lint' },
  { source: 'commit', target: 'typecheck' },
  { source: 'lint', target: 'build' },
  { source: 'typecheck', target: 'build' },
  { source: 'build', target: 'unit' },
  { source: 'build', target: 'scan' },
  { source: 'unit', target: 'integration' },
  { source: 'scan', target: 'integration' },
  { source: 'integration', target: 'staging' },
  { source: 'staging', target: 'e2e' },
  { source: 'e2e', target: 'deploy' },
]
