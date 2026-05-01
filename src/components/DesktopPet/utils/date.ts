// 缓存的日期字符串和对应的日期数值
let cachedDateStr = "";
let cachedDateDay = -1;

// 获取今日日期字符串（YYYY-MM-DD）
// 使用缓存避免每秒创建 Date 对象并格式化字符串
export function getTodayString(): string {
  const now = new Date();
  const day = now.getDate();
  // 只在日期变化时重新格式化
  if (day !== cachedDateDay) {
    cachedDateDay = day;
    cachedDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  return cachedDateStr;
}
