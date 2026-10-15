// 特效图标路径数据表 - 单 path + 纯色填充的图标统一由 FxIcon.vue 渲染
// （合并原 StarSvg/SparkleSvg/RoundStarSvg/HeartSvg/SweatDropSvg
// 五个结构相同的单文件组件）

export type FxIconName =
  "star" | "sparkle" | "roundStar" | "heart" | "sweatDrop";

export const ICON_PATHS: Record<
  FxIconName,
  { d: string; color: string; viewBox: string }
> = {
  // 尖角五角星
  star: {
    d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    color: "#fbbf24",
    viewBox: "0 0 24 24",
  },
  // 四角闪光星
  sparkle: {
    d: "M12 2L14.09 8.26L22 8.27L16.54 12.97L18.09 20.5L12 16.27L5.91 20.5L7.46 12.97L2 8.27L9.91 8.26L12 2Z",
    color: "#fef08a",
    viewBox: "0 0 24 24",
  },
  // 圆润五角星
  roundStar: {
    d: "M12 2 L14.4 8.5 L22 9 L16.5 13.5 L18.5 21 L12 16.5 L5.5 21 L7.5 13.5 L2 9 L9.6 8.5 Z",
    color: "#FFD700",
    viewBox: "0 0 24 24",
  },
  // 爱心
  heart: {
    d: "M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z",
    color: "#ff6b9d",
    viewBox: "0 0 24 24",
  },
  // 汗滴（宽高比 24:32）
  sweatDrop: {
    d: "M12 2C12 2 4 12 4 20C4 24.4 7.6 28 12 28C16.4 28 20 24.4 20 20C20 12 12 2 12 2Z",
    color: "#60a5fa",
    viewBox: "0 0 24 32",
  },
};
