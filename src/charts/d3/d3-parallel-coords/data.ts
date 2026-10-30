/** 编程语言多维评分演示数据（满分 100） */
export const dimensions = ['生态', '性能', '上手难度', '就业机会', '发展前景']

export interface LangScore {
  name: string
  scores: number[]
}

export const languages: LangScore[] = [
  { name: 'TypeScript', scores: [95, 78, 82, 96, 92] },
  { name: 'Python', scores: [97, 62, 90, 94, 90] },
  { name: 'Rust', scores: [78, 98, 42, 72, 95] },
  { name: 'Go', scores: [82, 92, 76, 84, 86] },
  { name: 'Java', scores: [93, 74, 66, 90, 74] },
  { name: 'Kotlin', scores: [74, 80, 72, 68, 78] },
  { name: 'Swift', scores: [70, 86, 74, 62, 70] },
  { name: 'C++', scores: [88, 96, 38, 78, 68] },
]
