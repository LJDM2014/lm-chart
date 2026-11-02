/** 电商微服务调用拓扑：节点按角色分组，边表示同步调用方向 */
export interface ServiceNode {
  id: string
  label: string
  /** gateway 流量入口 / core 核心域 / support 支撑域 */
  role: 'gateway' | 'core' | 'support'
}

export interface CallEdge {
  source: string
  target: string
}

export const serviceNodes: ServiceNode[] = [
  { id: 'gateway', label: 'API 网关', role: 'gateway' },
  { id: 'user', label: '用户服务', role: 'core' },
  { id: 'order', label: '订单服务', role: 'core' },
  { id: 'pay', label: '支付服务', role: 'core' },
  { id: 'stock', label: '库存服务', role: 'core' },
  { id: 'product', label: '商品服务', role: 'core' },
  { id: 'cart', label: '购物车', role: 'core' },
  { id: 'promo', label: '优惠券', role: 'support' },
  { id: 'notify', label: '消息中心', role: 'support' },
  { id: 'search', label: '搜索服务', role: 'support' },
  { id: 'rec', label: '推荐服务', role: 'support' },
  { id: 'risk', label: '风控服务', role: 'support' },
]

export const callEdges: CallEdge[] = [
  { source: 'gateway', target: 'user' },
  { source: 'gateway', target: 'order' },
  { source: 'gateway', target: 'product' },
  { source: 'gateway', target: 'search' },
  { source: 'gateway', target: 'cart' },
  { source: 'order', target: 'pay' },
  { source: 'order', target: 'stock' },
  { source: 'order', target: 'promo' },
  { source: 'order', target: 'user' },
  { source: 'cart', target: 'product' },
  { source: 'cart', target: 'promo' },
  { source: 'pay', target: 'risk' },
  { source: 'pay', target: 'notify' },
  { source: 'order', target: 'notify' },
  { source: 'search', target: 'product' },
  { source: 'rec', target: 'product' },
  { source: 'rec', target: 'search' },
  { source: 'cart', target: 'rec' },
  { source: 'risk', target: 'user' },
  { source: 'promo', target: 'product' },
]
