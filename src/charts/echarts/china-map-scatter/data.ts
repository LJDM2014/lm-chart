/** 全国主要城市科创指数演示数据（0-100，lon/lat 为城市坐标） */
export interface CityMetric {
  name: string
  lon: number
  lat: number
  /** 科创指数 */
  value: number
}

export const cityMetrics: CityMetric[] = [
  { name: '北京', lon: 116.4074, lat: 39.9042, value: 96 },
  { name: '上海', lon: 121.4737, lat: 31.2304, value: 93 },
  { name: '深圳', lon: 114.0579, lat: 22.5431, value: 91 },
  { name: '广州', lon: 113.2644, lat: 23.1291, value: 84 },
  { name: '杭州', lon: 120.1551, lat: 30.2741, value: 82 },
  { name: '南京', lon: 118.7969, lat: 32.0603, value: 76 },
  { name: '成都', lon: 104.0665, lat: 30.5728, value: 74 },
  { name: '武汉', lon: 114.3054, lat: 30.5928, value: 72 },
  { name: '苏州', lon: 120.5853, lat: 31.2989, value: 70 },
  { name: '西安', lon: 108.9402, lat: 34.3416, value: 65 },
  { name: '合肥', lon: 117.2272, lat: 31.8206, value: 63 },
  { name: '重庆', lon: 106.5516, lat: 29.5630, value: 62 },
  { name: '长沙', lon: 112.9388, lat: 28.2282, value: 58 },
  { name: '天津', lon: 117.1901, lat: 39.1255, value: 57 },
  { name: '青岛', lon: 120.3826, lat: 36.0671, value: 55 },
  { name: '郑州', lon: 113.6254, lat: 34.7466, value: 52 },
  { name: '厦门', lon: 118.0894, lat: 24.4798, value: 50 },
  { name: '大连', lon: 121.6147, lat: 38.9140, value: 46 },
]

export const METRIC_NAME = '科创指数'
