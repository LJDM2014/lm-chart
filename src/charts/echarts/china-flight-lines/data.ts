/** 春运迁徙飞线演示数据：枢纽 → 目的地城市，value 为日均流动规模（万人次） */
export interface CityCoord {
  name: string
  lon: number
  lat: number
}

export const cities: CityCoord[] = [
  { name: '广州', lon: 113.2644, lat: 23.1291 },
  { name: '上海', lon: 121.4737, lat: 31.2304 },
  { name: '北京', lon: 116.4074, lat: 39.9042 },
  { name: '深圳', lon: 114.0579, lat: 22.5431 },
  { name: '成都', lon: 104.0665, lat: 30.5728 },
  { name: '长沙', lon: 112.9388, lat: 28.2282 },
  { name: '武汉', lon: 114.3054, lat: 30.5928 },
  { name: '郑州', lon: 113.6254, lat: 34.7466 },
  { name: '西安', lon: 108.9402, lat: 34.3416 },
  { name: '重庆', lon: 106.5516, lat: 29.563 },
  { name: '杭州', lon: 120.1551, lat: 30.2741 },
  { name: '南京', lon: 118.7969, lat: 32.0603 },
  { name: '合肥', lon: 117.2272, lat: 31.8206 },
  { name: '南昌', lon: 115.8581, lat: 28.6832 },
  { name: '贵阳', lon: 106.6302, lat: 26.6477 },
  { name: '南宁', lon: 108.3665, lat: 22.8172 },
  { name: '昆明', lon: 102.8329, lat: 25.0458 },
  { name: '哈尔滨', lon: 126.6425, lat: 45.7570 },
  { name: '沈阳', lon: 123.4315, lat: 41.8057 },
  { name: '兰州', lon: 103.8343, lat: 36.0611 },
]

export interface FlowRoute {
  from: string
  to: string
  /** 日均流动规模（万人次） */
  value: number
}

export const flowRoutes: FlowRoute[] = [
  { from: '广州', to: '长沙', value: 18.6 },
  { from: '广州', to: '武汉', value: 14.2 },
  { from: '广州', to: '南宁', value: 12.8 },
  { from: '广州', to: '南昌', value: 9.5 },
  { from: '广州', to: '贵阳', value: 8.7 },
  { from: '上海', to: '合肥', value: 13.4 },
  { from: '上海', to: '南京', value: 11.9 },
  { from: '上海', to: '武汉', value: 8.3 },
  { from: '上海', to: '郑州', value: 7.1 },
  { from: '北京', to: '哈尔滨', value: 10.6 },
  { from: '北京', to: '沈阳', value: 9.8 },
  { from: '北京', to: '西安', value: 8.9 },
  { from: '深圳', to: '昆明', value: 7.4 },
  { from: '深圳', to: '长沙', value: 12.1 },
  { from: '成都', to: '重庆', value: 9.2 },
  { from: '成都', to: '兰州', value: 5.6 },
  { from: '成都', to: '昆明', value: 4.8 },
  { from: '杭州', to: '南昌', value: 5.2 },
  { from: '重庆', to: '贵阳', value: 4.3 },
  { from: '西安', to: '兰州', value: 3.9 },
]

/** 城市名 → 坐标 */
export const cityCoordMap: Record<string, CityCoord> = Object.fromEntries(
  cities.map((c) => [c.name, c]),
)
