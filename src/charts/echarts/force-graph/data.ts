/** 团队成员协作网络演示数据 */
export interface GraphNode {
  name: string
  category: number
  symbolSize: number
  value?: string
}

export interface GraphLink {
  source: string
  target: string
}

export const categories = [
  { name: '前端' },
  { name: '后端' },
  { name: '设计' },
  { name: '产品' },
]

export const nodes: GraphNode[] = [
  { name: '张伟', category: 0, symbolSize: 42, value: '前端负责人' },
  { name: '李娜', category: 0, symbolSize: 30, value: '资深前端' },
  { name: '王强', category: 0, symbolSize: 24, value: '前端工程师' },
  { name: '赵敏', category: 0, symbolSize: 20, value: '前端工程师' },
  { name: '陈杰', category: 1, symbolSize: 38, value: '后端负责人' },
  { name: '刘洋', category: 1, symbolSize: 26, value: '后端工程师' },
  { name: '孙丽', category: 1, symbolSize: 22, value: '后端工程师' },
  { name: '周涛', category: 1, symbolSize: 18, value: '运维' },
  { name: '吴静', category: 2, symbolSize: 34, value: '设计负责人' },
  { name: '郑浩', category: 2, symbolSize: 22, value: 'UI 设计师' },
  { name: '冯雪', category: 2, symbolSize: 20, value: '交互设计' },
  { name: '何磊', category: 3, symbolSize: 36, value: '产品经理' },
  { name: '许晴', category: 3, symbolSize: 24, value: '产品助理' },
  { name: '吕明', category: 3, symbolSize: 18, value: '数据分析' },
]

export const links: GraphLink[] = [
  { source: '张伟', target: '李娜' },
  { source: '张伟', target: '王强' },
  { source: '张伟', target: '赵敏' },
  { source: '李娜', target: '王强' },
  { source: '李娜', target: '赵敏' },
  { source: '张伟', target: '陈杰' },
  { source: '张伟', target: '吴静' },
  { source: '张伟', target: '何磊' },
  { source: '陈杰', target: '刘洋' },
  { source: '陈杰', target: '孙丽' },
  { source: '陈杰', target: '周涛' },
  { source: '刘洋', target: '孙丽' },
  { source: '吴静', target: '郑浩' },
  { source: '吴静', target: '冯雪' },
  { source: '何磊', target: '许晴' },
  { source: '何磊', target: '吕明' },
  { source: '何磊', target: '吴静' },
  { source: '何磊', target: '陈杰' },
  { source: '李娜', target: '吴静' },
  { source: '刘洋', target: '周涛' },
]
