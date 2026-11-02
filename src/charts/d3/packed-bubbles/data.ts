/** 主流 App 月活规模演示数据（亿，2025 口径） */
export interface AppUsage {
  name: string
  /** 品类分组 */
  group: string
  /** 月活跃用户（亿） */
  value: number
}

export const APP_GROUPS = ['社交', '短视频', '电商', '生活服务', '工具', '长视频', '音乐'] as const

export const APP_USAGE: AppUsage[] = [
  { name: '微信', group: '社交', value: 13.8 },
  { name: 'QQ', group: '社交', value: 5.7 },
  { name: '微博', group: '社交', value: 5.6 },
  { name: '知乎', group: '社交', value: 1.1 },
  { name: '抖音', group: '短视频', value: 7.6 },
  { name: '快手', group: '短视频', value: 6.5 },
  { name: '小红书', group: '短视频', value: 3.2 },
  { name: 'B站', group: '短视频', value: 2.4 },
  { name: '淘宝', group: '电商', value: 8.9 },
  { name: '拼多多', group: '电商', value: 7.1 },
  { name: '京东', group: '电商', value: 4.8 },
  { name: '闲鱼', group: '电商', value: 2.1 },
  { name: '美团', group: '生活服务', value: 5.2 },
  { name: '饿了么', group: '生活服务', value: 1.7 },
  { name: '携程', group: '生活服务', value: 1.9 },
  { name: '高德地图', group: '工具', value: 3.4 },
  { name: '百度地图', group: '工具', value: 3.1 },
  { name: '钉钉', group: '工具', value: 2.5 },
  { name: '网易云音乐', group: '音乐', value: 2.1 },
  { name: '爱奇艺', group: '长视频', value: 2.8 },
  { name: '腾讯视频', group: '长视频', value: 3.0 },
  { name: '优酷', group: '长视频', value: 2.0 },
]
