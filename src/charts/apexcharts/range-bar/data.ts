/** 2026 年四个重点项目各阶段排期（起止日期） */
export interface PhaseRange {
  project: string
  from: Date
  to: Date
}

export interface PhaseSeries {
  name: string
  ranges: PhaseRange[]
}

function d(month: number, day: number): Date {
  return new Date(2026, month - 1, day)
}

export const phaseSeries: PhaseSeries[] = [
  {
    name: '设计',
    ranges: [
      { project: '官网改版', from: d(1, 6), to: d(2, 14) },
      { project: 'App 3.0', from: d(2, 2), to: d(3, 20) },
      { project: '会员小程序', from: d(4, 6), to: d(5, 8) },
      { project: '数据中台', from: d(6, 1), to: d(7, 24) },
    ],
  },
  {
    name: '开发',
    ranges: [
      { project: '官网改版', from: d(2, 10), to: d(4, 3) },
      { project: 'App 3.0', from: d(3, 8), to: d(6, 12) },
      { project: '会员小程序', from: d(4, 28), to: d(6, 26) },
      { project: '数据中台', from: d(7, 6), to: d(10, 16) },
    ],
  },
  {
    name: '测试',
    ranges: [
      { project: '官网改版', from: d(3, 24), to: d(4, 18) },
      { project: 'App 3.0', from: d(5, 20), to: d(6, 30) },
      { project: '会员小程序', from: d(6, 8), to: d(7, 10) },
      { project: '数据中台', from: d(9, 22), to: d(11, 13) },
    ],
  },
]
