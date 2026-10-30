/** 渠道流量占比演示数据 */
export interface ChannelShare {
  channel: string
  value: number
}

export const channels: ChannelShare[] = [
  { channel: '自然搜索', value: 42 },
  { channel: '社交媒体', value: 28 },
  { channel: '直接访问', value: 16 },
  { channel: '广告投放', value: 9 },
  { channel: '邮件推广', value: 5 },
]
