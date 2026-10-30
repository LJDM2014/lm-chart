/** 电商转化漏斗演示数据 */
export interface FunnelStage {
  stage: string
  value: number
}

export const stages: FunnelStage[] = [
  { stage: '浏览商品', value: 100 },
  { stage: '加入购物车', value: 62 },
  { stage: '提交订单', value: 38 },
  { stage: '完成支付', value: 25 },
]
