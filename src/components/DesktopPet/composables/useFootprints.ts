import { ref } from "vue";
import type { PetDirection, Footprint } from "../types";
import { PET_SIZE, FOOTPRINT_INTERVAL, FOOTPRINT_LIFETIME, MAX_FOOTPRINTS } from "../constants";

// 脚印状态
export const footprints = ref<Footprint[]>([]);
export const lastFootprintTime = ref(0);
export const lastFootprintWasLeft = ref(false);
export const footprintIdCounter = ref(0);

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
  };

  footprints.value.push(newFootprint);

  // 限制脚印数量
  if (footprints.value.length > MAX_FOOTPRINTS) {
    footprints.value.shift();
  }
}

// 清理过期的脚印
export function cleanupFootprints() {
  const now = Date.now();
  footprints.value = footprints.value.filter(
    (fp) => now - fp.createdAt < FOOTPRINT_LIFETIME
  );
}

// 获取脚印透明度
export function getFootprintOpacity(footprint: Footprint): number {
  const age = Date.now() - footprint.createdAt;
  const remaining = FOOTPRINT_LIFETIME - age;
  return Math.max(0, remaining / FOOTPRINT_LIFETIME);
}
