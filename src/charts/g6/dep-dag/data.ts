/** monorepo 包依赖 DAG：节点分核心 / 服务 / 界面 / 应用四个层级，边表示「被依赖」方向的引用 */
export interface DepNode {
  id: string
  /** 包显示名（npm scope 简写） */
  label: string
  /** 层级：core 基础核心 / service 服务 / ui 界面 / app 应用入口 */
  tier: 'core' | 'service' | 'ui' | 'app'
}

export interface DepEdge {
  source: string
  target: string
}

export const depNodes: DepNode[] = [
  { id: 'core', label: '@mono/core', tier: 'core' },
  { id: 'utils', label: '@mono/utils', tier: 'core' },
  { id: 'logger', label: '@mono/logger', tier: 'core' },
  { id: 'http', label: '@mono/http-client', tier: 'service' },
  { id: 'auth', label: '@mono/auth', tier: 'service' },
  { id: 'store', label: '@mono/store', tier: 'service' },
  { id: 'router', label: '@mono/router', tier: 'service' },
  { id: 'ui-kit', label: '@mono/ui-kit', tier: 'ui' },
  { id: 'charts', label: '@mono/charts', tier: 'ui' },
  { id: 'forms', label: '@mono/forms', tier: 'ui' },
  { id: 'web', label: '@mono/web-app', tier: 'app' },
  { id: 'cli', label: '@mono/cli', tier: 'app' },
]

export const depEdges: DepEdge[] = [
  { source: 'core', target: 'http' },
  { source: 'core', target: 'auth' },
  { source: 'core', target: 'store' },
  { source: 'core', target: 'router' },
  { source: 'core', target: 'ui-kit' },
  { source: 'core', target: 'cli' },
  { source: 'utils', target: 'http' },
  { source: 'utils', target: 'store' },
  { source: 'utils', target: 'ui-kit' },
  { source: 'logger', target: 'http' },
  { source: 'logger', target: 'cli' },
  { source: 'http', target: 'auth' },
  { source: 'http', target: 'charts' },
  { source: 'auth', target: 'forms' },
  { source: 'auth', target: 'web' },
  { source: 'store', target: 'ui-kit' },
  { source: 'router', target: 'web' },
  { source: 'ui-kit', target: 'charts' },
  { source: 'ui-kit', target: 'forms' },
  { source: 'ui-kit', target: 'web' },
  { source: 'charts', target: 'web' },
  { source: 'forms', target: 'web' },
]
