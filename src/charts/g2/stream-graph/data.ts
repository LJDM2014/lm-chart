/** 五大音乐流派历年唱片销量（万张），1970-2020 每 10 年一个观测点 */
export interface GenreStream {
  year: number
  genre: string
  value: number
}

export const genreStreams: GenreStream[] = [
  // 流行：长期主流，稳中有升
  { year: 1970, genre: '流行', value: 420 }, { year: 1980, genre: '流行', value: 560 },
  { year: 1990, genre: '流行', value: 680 }, { year: 2000, genre: '流行', value: 720 },
  { year: 2010, genre: '流行', value: 780 }, { year: 2020, genre: '流行', value: 860 },
  // 摇滚：70-80 年代黄金期，随后衰退
  { year: 1970, genre: '摇滚', value: 380 }, { year: 1980, genre: '摇滚', value: 640 },
  { year: 1990, genre: '摇滚', value: 590 }, { year: 2000, genre: '摇滚', value: 430 },
  { year: 2010, genre: '摇滚', value: 310 }, { year: 2020, genre: '摇滚', value: 260 },
  // 嘻哈：90 年代崛起，持续攀升
  { year: 1970, genre: '嘻哈', value: 0 }, { year: 1980, genre: '嘻哈', value: 40 },
  { year: 1990, genre: '嘻哈', value: 180 }, { year: 2000, genre: '嘻哈', value: 420 },
  { year: 2010, genre: '嘻哈', value: 580 }, { year: 2020, genre: '嘻哈', value: 720 },
  // 电子：80 年代萌芽，2000 年后爆发
  { year: 1970, genre: '电子', value: 20 }, { year: 1980, genre: '电子', value: 120 },
  { year: 1990, genre: '电子', value: 210 }, { year: 2000, genre: '电子', value: 380 },
  { year: 2010, genre: '电子', value: 520 }, { year: 2020, genre: '电子', value: 640 },
  // R&B：稳定的中坚力量
  { year: 1970, genre: 'R&B', value: 260 }, { year: 1980, genre: 'R&B', value: 340 },
  { year: 1990, genre: 'R&B', value: 390 }, { year: 2000, genre: 'R&B', value: 360 },
  { year: 2010, genre: 'R&B', value: 320 }, { year: 2020, genre: 'R&B', value: 350 },
]
