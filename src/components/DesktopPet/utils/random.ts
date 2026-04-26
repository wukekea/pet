// 随机选择数组中的一个元素
export function randomPick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 生成 [min, max) 范围内的随机整数
export function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min));
}
