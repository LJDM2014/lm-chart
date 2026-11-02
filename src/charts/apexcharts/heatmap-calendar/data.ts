/** 近 24 周代码提交日历数据（确定性伪随机生成，无外部依赖） */
export const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

export interface HeatCell {
  x: string
  y: number
}

/** 每行一个星期、每列一周，还原贡献日历布局 */
export const commitCalendar: Record<string, HeatCell[]> = Object.fromEntries(
  WEEKDAYS.map((weekday, row) => {
    const cells = Array.from({ length: 24 }, (_, week) => {
      // 工作日提交多、临近周末渐少；带平滑波动的确定性噪声
      const workFactor = row < 5 ? 1 - row * 0.08 : 0.35
      const wave = Math.sin((week / 24) * Math.PI * 2.5) * 0.5 + 0.5
      const noise = (((row * 37 + week * 17) % 13) / 13) * 0.55 + 0.45
      const commitCount = Math.round(28 * workFactor * (0.45 + wave * 0.55) * noise)
      return { x: `第${week + 1}周`, y: commitCount }
    })
    return [weekday, cells]
  }),
)
