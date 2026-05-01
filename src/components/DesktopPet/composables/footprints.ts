import { ref } from "vue";
import type { PetDirection, Footprint, FootprintType } from "../types";
import {
  PET_SIZE,
  FOOTPRINT_INTERVAL,
  FOOTPRINT_LIFETIME,
  MAX_FOOTPRINTS,
} from "../constants";
import { currentWeather } from "./weatherState";

// 脚印状态
export const footprints = ref<Footprint[]>([]);
export const lastFootprintTime = ref(0);
export const lastFootprintWasLeft = ref(false);
export const footprintIdCounter = ref(0);

// 脚印清理定时器
let cleanupTimerId: ReturnType<typeof setInterval> | null = null;

// 根据天气获取脚印类型
function getFootprintType(): FootprintType {
  const weather = currentWeather.value;
  if (weather === "lightSnow" || weather === "heavySnow") {
    return "snow";
  }
  if (
    weather === "lightRain" ||
    weather === "heavyRain" ||
    weather === "thunderstorm"
  ) {
    return "water";
  }
  return "default";
}

// 启动脚印清理定时器（仅在有脚印时运行）
export function startFootprintCleanup() {
  if (cleanupTimerId !== null) return;
  cleanupTimerId = setInterval(() => {
    const now = Date.now();
    footprints.value = footprints.value.filter(
      (fp) => now - fp.createdAt < FOOTPRINT_LIFETIME,
    );
    // 脚印清空后自动停止定时器
    if (footprints.value.length === 0) {
      stopFootprintCleanup();
    }
  }, 500); // 每 500ms 清理一次，足够平滑
}

// 停止脚印清理定时器
export function stopFootprintCleanup() {
  if (cleanupTimerId !== null) {
    clearInterval(cleanupTimerId);
    cleanupTimerId = null;
  }
}

// 添加脚印
export function addFootprint(x: number, y: number, direction: PetDirection) {
  const now = Date.now();
  if (now - lastFootprintTime.value < FOOTPRINT_INTERVAL) return;

  lastFootprintTime.value = now;
  lastFootprintWasLeft.value = !lastFootprintWasLeft.value;

  // 计算脚印位置（在宠物底部）
  const footprintX = x + PET_SIZE / 2 + (lastFootprintWasLeft.value ? -15 : 15);
  const footprintY = y + PET_SIZE - 5;

  const newFootprint: Footprint = {
    id: footprintIdCounter.value++,
    x: footprintX,
    y: footprintY,
    isLeft: lastFootprintWasLeft.value,
    direction: direction,
    createdAt: now,
    type: getFootprintType(),
  };

  footprints.value.push(newFootprint);

  // 限制脚印数量
  if (footprints.value.length > MAX_FOOTPRINTS) {
    footprints.value.shift();
  }

  // 有新脚印时确保清理定时器在运行
  startFootprintCleanup();
}
