import { ref } from "vue";
import type {
  AttributeData,
  PetState,
  FoodType,
  BathType,
  DecorationType,
} from "../types";
import { getTodayString } from "../utils/date";
import { createDebouncedSave } from "../utils/debouncedSave";
import {
  petState,
  currentFood,
  currentBathType,
  isDragging,
  coinGainAmount,
  mood,
} from "./sharedState";
import { currentWeather } from "./weatherState";
import {
  SATIETY_DECAY_INTERVAL,
  CLEANLINESS_DECAY_INTERVAL,
  STAMINA_WORK_DRAIN_INTERVAL,
  STAMINA_NORMAL_RECOVER_INTERVAL,
  STAMINA_SLEEP_RECOVER_INTERVAL,
  HEALTH_DECAY_HUNGRY_INTERVAL,
  HEALTH_DECAY_DIRTY_INTERVAL,
  HEALTH_RECOVER_INTERVAL,
  HUNGRY_THRESHOLD,
  DIRTY_THRESHOLD,
  AUTO_EAT_SATIETY_TARGET,
  AUTO_BATH_CLEANLINESS_TARGET,
  HEALTH_HAPPY_THRESHOLD,
  HEALTH_SICK_THRESHOLD,
  MAX_LEVEL,
  INTERACTION_EXPERIENCE,
  COMPANIONSHIP_EXPERIENCE,
  COMPANIONSHIP_INTERVAL,
  HEALTH_CAP,
  DAILY_ALLOWANCE,
  DAILY_ALLOWANCE_THRESHOLD,
  DAILY_INTERACTION_EXPERIENCE_CAP,
} from "../constants";
import {
  loadAttributeData,
  saveAttributeData,
  getAttributeCap,
  getExpRequiredForLevel,
  FOOD_CONFIGS,
  BATH_CONFIGS,
  DECORATION_CONFIGS,
  DECORATION_SLOTS,
  MAX_EQUIPPED_DECORATIONS,
  WORK_INCOME,
  WORK_EXPERIENCE,
  WORK_STAMINA_REQUIRED,
  getActiveEffects,
} from "./attributeStorage";
import { isWorkState } from "./petController";

// 响应式属性数据
const attributeData = ref<AttributeData>(loadAttributeData());

// 回调函数（由 petController 注册，避免循环依赖）
let requestStateChange: ((state: PetState) => void) | null = null;

// 计时器
let tickTimer: ReturnType<typeof setInterval> | null = null;

// 防抖保存
const { save: debouncedSave, flush: flushSave } = createDebouncedSave(() =>
  saveAttributeData(attributeData.value),
);

// tick 累加计数器
let tickCount = 0;
let companionshipTickCount = 0;

// 装饰效果分数累加器
let satietyDecayAcc = 0;
let cleanlinessDecayAcc = 0;
let staminaRecoverAcc = 0;
let staminaSleepRecoverAcc = 0;
let healthRecoverAcc = 0;

// 心情更新间隔（每 10 秒计算一次）
const MOOD_UPDATE_INTERVAL = 10;

// 天气对心情的修正值
const WEATHER_MOOD_MODIFIERS: Record<string, number> = {
  sunny: 10,
  lightSnow: 5,
  heavySnow: -10,
  heavyRain: -10,
  thunderstorm: -15,
};

// 更新心情值
function updateMood(): void {
  const data = attributeData.value;
  const cap = getAttributeCap(data.level);

  // 属性基础分：各属性占上限百分比的加权平均（0-100）
  const satietyPercent = (data.satiety / cap) * 100;
  const cleanlinessPercent = (data.cleanliness / cap) * 100;
  const staminaPercent = (data.stamina / cap) * 100;
  const healthPercent = (data.health / HEALTH_CAP) * 100;
  const baseMood =
    (satietyPercent + cleanlinessPercent + staminaPercent + healthPercent) / 4;

  // 天气修正
  const weatherModifier = WEATHER_MOOD_MODIFIERS[currentWeather.value] ?? 0;

  // 最终心情值（0-100）
  mood.value = Math.round(
    Math.max(0, Math.min(100, baseMood + weatherModifier)),
  );
}

// 判断是否是可以触发自动行为的状态
function canTriggerAutoBehavior(): boolean {
  const state = petState.value;
  // 打工和睡眠期间不触发
  if (isWorkState(state)) return false;
  if (state === "sleeping" || state === "yawn" || state === "sleepy")
    return false;
  // 拖拽中不触发
  if (isDragging.value) return false;
  return true;
}

// 注册回调（由 petController 调用）
export function registerAttributeCallbacks(callbacks: {
  requestStateChange: (state: PetState) => void;
  requestStopWork: () => void;
}): void {
  requestStateChange = callbacks.requestStateChange;
  // requestStopWork 保留供未来扩展使用
}

// 获取属性数据（只读）
export function getAttributeData(): AttributeData {
  return attributeData.value;
}

// 获取响应式 ref（供 UI 使用）
export function useAttributeRef() {
  return attributeData;
}

// 获取当前属性上限
export function getCurrentAttributeCap(): number {
  return getAttributeCap(attributeData.value.level);
}

// 获取当前等级经验进度百分比
export function getExpProgress(): number {
  const required = getExpRequiredForLevel(attributeData.value.level);
  return Math.min((attributeData.value.experience / required) * 100, 100);
}

// 获取今日交互经验进度（已获得/上限）
export function getDailyInteractionProgress(): {
  earned: number;
  cap: number;
} {
  const data = attributeData.value;
  const today = getTodayString();
  if (data.dailyInteractionExpDate !== today) {
    return { earned: 0, cap: DAILY_INTERACTION_EXPERIENCE_CAP };
  }
  return {
    earned: data.dailyInteractionExp,
    cap: DAILY_INTERACTION_EXPERIENCE_CAP,
  };
}

// 每秒 tick 逻辑
function tick(): void {
  tickCount++;
  companionshipTickCount++;

  const data = attributeData.value;
  const state = petState.value;
  const cap = getAttributeCap(data.level);

  // 跨午夜检查：重置每日交互经验，发放每日救济金
  const today = getTodayString();
  if (data.dailyInteractionExpDate !== today) {
    data.dailyInteractionExpDate = today;
    data.dailyInteractionExp = 0;
  }
  // 每日救济金：金币低于阈值时自动发放
  if (
    data.dailyAllowanceClaimed !== today &&
    data.money < DAILY_ALLOWANCE_THRESHOLD
  ) {
    data.money += DAILY_ALLOWANCE;
    data.dailyAllowanceClaimed = today;
  }

  // 饱腹值衰减（搬砖时加速 3 倍）
  const satietyInterval =
    state === "brickCarrying"
      ? Math.floor(SATIETY_DECAY_INTERVAL / 3)
      : SATIETY_DECAY_INTERVAL;
  if (tickCount % satietyInterval === 0) {
    const effects = getActiveEffects(data.equippedDecorations);
    const reduction =
      (effects.satietyDecayReduction ?? 0) + (effects.allDecayReduction ?? 0);
    if (reduction > 0) {
      satietyDecayAcc += reduction;
      if (satietyDecayAcc >= 1) {
        satietyDecayAcc -= 1;
        // 跳过本次衰减
      } else {
        data.satiety = Math.max(0, data.satiety - 1);
      }
    } else {
      data.satiety = Math.max(0, data.satiety - 1);
    }
  }

  // 清洁值衰减（搬砖时加速 3 倍）
  const cleanlinessInterval =
    state === "brickCarrying"
      ? Math.floor(CLEANLINESS_DECAY_INTERVAL / 3)
      : CLEANLINESS_DECAY_INTERVAL;
  if (tickCount % cleanlinessInterval === 0) {
    const effects = getActiveEffects(data.equippedDecorations);
    const reduction =
      (effects.cleanlinessDecayReduction ?? 0) +
      (effects.allDecayReduction ?? 0);
    if (reduction > 0) {
      cleanlinessDecayAcc += reduction;
      if (cleanlinessDecayAcc >= 1) {
        cleanlinessDecayAcc -= 1;
      } else {
        data.cleanliness = Math.max(0, data.cleanliness - 1);
      }
    } else {
      data.cleanliness = Math.max(0, data.cleanliness - 1);
    }
  }

  // 体力值变化
  const effects = getActiveEffects(data.equippedDecorations);
  const staminaBonus = effects.staminaRecoverBonus ?? 0;

  if (isWorkState(state)) {
    // 打工时体力消耗
    if (tickCount % STAMINA_WORK_DRAIN_INTERVAL === 0) {
      data.stamina = Math.max(0, data.stamina - 1);
    }
  } else if (state === "sleeping") {
    // 睡眠时体力恢复
    if (tickCount % STAMINA_SLEEP_RECOVER_INTERVAL === 0) {
      if (staminaBonus > 0) {
        staminaSleepRecoverAcc += staminaBonus;
        const extra = staminaSleepRecoverAcc >= 1 ? 1 : 0;
        if (extra) staminaSleepRecoverAcc -= 1;
        data.stamina = Math.min(cap, data.stamina + 1 + extra);
      } else {
        data.stamina = Math.min(cap, data.stamina + 1);
      }
    }
  } else {
    // 平时体力缓慢恢复
    if (tickCount % STAMINA_NORMAL_RECOVER_INTERVAL === 0) {
      if (staminaBonus > 0) {
        staminaRecoverAcc += staminaBonus;
        const extra = staminaRecoverAcc >= 1 ? 1 : 0;
        if (extra) staminaRecoverAcc -= 1;
        data.stamina = Math.min(cap, data.stamina + 1 + extra);
      } else {
        data.stamina = Math.min(cap, data.stamina + 1);
      }
    }
  }

  // 健康值变化
  const isHungry = data.satiety < HUNGRY_THRESHOLD;
  const isDirty = data.cleanliness < DIRTY_THRESHOLD;

  if (isHungry && tickCount % HEALTH_DECAY_HUNGRY_INTERVAL === 0) {
    data.health = Math.max(0, data.health - 1);
  }
  if (isDirty && tickCount % HEALTH_DECAY_DIRTY_INTERVAL === 0) {
    data.health = Math.max(0, data.health - 1);
  }
  if (!isHungry && !isDirty && tickCount % HEALTH_RECOVER_INTERVAL === 0) {
    const healthBonus = effects.healthRecoverBonus ?? 0;
    if (healthBonus > 0) {
      healthRecoverAcc += healthBonus;
      const extra = healthRecoverAcc >= 1 ? 1 : 0;
      if (extra) healthRecoverAcc -= 1;
      data.health = Math.min(HEALTH_CAP, data.health + 1 + extra);
    } else {
      data.health = Math.min(HEALTH_CAP, data.health + 1);
    }
  }

  // 陪伴经验
  if (companionshipTickCount % COMPANIONSHIP_INTERVAL === 0) {
    addExperience(COMPANIONSHIP_EXPERIENCE);
  }

  // 更新心情（每 10 秒一次）
  if (tickCount % MOOD_UPDATE_INTERVAL === 0) {
    updateMood();
  }

  // 更新时间戳
  data.lastUpdateTimestamp = Date.now();

  // 检查自动行为
  checkAutoBehaviors();

  // 防抖保存
  debouncedSave();
}

// 自动行为检查
function checkAutoBehaviors(): void {
  if (!canTriggerAutoBehavior()) return;

  const data = attributeData.value;

  // 体力为0强制睡觉
  if (data.stamina <= 0) {
    if (requestStateChange) {
      requestStateChange("sleeping");
    }
    return;
  }

  // 自动吃饭
  if (data.satiety < HUNGRY_THRESHOLD) {
    checkAutoEat();
    return; // 一次只触发一个自动行为
  }

  // 自动洗澡
  if (data.cleanliness < DIRTY_THRESHOLD) {
    checkAutoBath();
  }
}

// 自动吃饭逻辑
function checkAutoEat(): void {
  const data = attributeData.value;
  // 优先从库存中找食物
  const inventoryFoods = Object.entries(data.foodInventory)
    .filter(([, count]) => count > 0)
    .map(([type]) => FOOD_CONFIGS[type as FoodType])
    .filter(Boolean)
    .sort((a, b) => a.cost - b.cost);

  if (inventoryFoods.length > 0) {
    // 优先选择能让饱腹达到目标的
    const targetSatiety = AUTO_EAT_SATIETY_TARGET;
    const bestFood =
      inventoryFoods.find(
        (f) => data.satiety + f.satietyRestore >= targetSatiety,
      ) || inventoryFoods[0];

    useFood(bestFood.type, true);
    return;
  }

  // 库存为空，尝试购买最便宜的
  const affordableFoods = Object.values(FOOD_CONFIGS)
    .filter((f) => f.cost <= data.money)
    .sort((a, b) => a.cost - b.cost);

  if (affordableFoods.length === 0) return;

  const bestFood = affordableFoods[0];
  buyFoodItem(bestFood.type);
  useFood(bestFood.type, true);
}

// 自动洗澡逻辑
function checkAutoBath(): void {
  const data = attributeData.value;
  // 优先从库存中找沐浴露
  const inventoryBaths = Object.entries(data.bathInventory)
    .filter(([, count]) => count > 0)
    .map(([type]) => BATH_CONFIGS[type as BathType])
    .filter(Boolean)
    .sort((a, b) => a.cost - b.cost);

  if (inventoryBaths.length > 0) {
    const bestBath =
      inventoryBaths.find(
        (b) =>
          data.cleanliness + b.cleanlinessRestore >=
          AUTO_BATH_CLEANLINESS_TARGET,
      ) || inventoryBaths[0];

    useBathItem(bestBath.type, true);
    return;
  }

  // 库存为空，尝试购买最便宜的
  const affordableBaths = Object.values(BATH_CONFIGS)
    .filter((b) => b.cost <= data.money)
    .sort((a, b) => a.cost - b.cost);

  if (affordableBaths.length === 0) return;

  const bestBath = affordableBaths[0];
  buyBathItem(bestBath.type);
  useBathItem(bestBath.type, true);
}

// 通用购买逻辑 - 扣钱、入库存、加经验
function buyToInventory<K extends string>(
  itemType: K,
  inventoryKey: "foodInventory" | "bathInventory" | "decorationInventory",
  getCost: (type: K) => number,
  extraCheck?: (data: AttributeData, type: K) => boolean,
): boolean {
  const data = attributeData.value;
  const cost = getCost(itemType);
  if (data.money < cost) return false;
  if (extraCheck && !extraCheck(data, itemType)) return false;

  data.money -= cost;
  const inventory = { ...(data[inventoryKey] as Record<string, number>) };
  inventory[itemType] = (inventory[itemType] || 0) + 1;
  (data as any)[inventoryKey] = inventory;

  addInteractionExpWithLimit(INTERACTION_EXPERIENCE);
  debouncedSave();
  return true;
}

// 购买食物（加入库存）
export function buyFoodItem(foodType: FoodType): boolean {
  return buyToInventory(foodType, "foodInventory", (t) => FOOD_CONFIGS[t].cost);
}

// 购买沐浴露（加入库存）
export function buyBathItem(bathType: BathType): boolean {
  return buyToInventory(bathType, "bathInventory", (t) => BATH_CONFIGS[t].cost);
}

// 购买装饰（加入库存）
export function buyDecoration(decorationType: DecorationType): boolean {
  return buyToInventory(
    decorationType,
    "decorationInventory",
    (t) => DECORATION_CONFIGS[t].cost,
    (data, t) => !data.ownedDecorations.includes(t),
  );
}

// 通用消耗逻辑 - 从库存扣除、恢复属性、触发状态
function useFromInventory<K extends string>(
  itemType: K,
  inventoryKey: "foodInventory" | "bathInventory",
  attributeKey: "satiety" | "cleanliness",
  getRestore: (type: K) => number,
  state: PetState,
  setCurrent: (type: K) => void,
  isAuto = false,
): boolean {
  const data = attributeData.value;
  const count = (data[inventoryKey] as Record<string, number>)[itemType] || 0;
  if (count <= 0) return false;

  const cap = getAttributeCap(data.level);
  const inventory = { ...(data[inventoryKey] as Record<string, number>) };
  inventory[itemType] = count - 1;
  if (inventory[itemType] <= 0) delete inventory[itemType];
  (data as any)[inventoryKey] = inventory;

  const restore = getRestore(itemType);
  (data as any)[attributeKey] = Math.min(
    cap,
    (data as any)[attributeKey] + restore,
  );
  setCurrent(itemType);

  if (requestStateChange) {
    requestStateChange(state);
  }

  if (!isAuto) {
    addInteractionExpWithLimit(INTERACTION_EXPERIENCE);
  }

  debouncedSave();
  return true;
}

// 使用食物（从库存消耗，恢复饱腹值）
export function useFood(foodType: FoodType, isAuto = false): boolean {
  return useFromInventory(
    foodType,
    "foodInventory",
    "satiety",
    (t) => FOOD_CONFIGS[t].satietyRestore,
    "eating",
    (t) => (currentFood.value = t),
    isAuto,
  );
}

// 使用沐浴露（从库存消耗，恢复清洁值）
export function useBathItem(bathType: BathType, isAuto = false): boolean {
  return useFromInventory(
    bathType,
    "bathInventory",
    "cleanliness",
    (t) => BATH_CONFIGS[t].cleanlinessRestore,
    "bathing",
    (t) => (currentBathType.value = t),
    isAuto,
  );
}

// 使用装饰（从库存取出，变为拥有）
export function useDecoration(decorationType: DecorationType): boolean {
  const data = attributeData.value;
  const count = data.decorationInventory[decorationType] || 0;
  if (count <= 0) return false;
  if (data.ownedDecorations.includes(decorationType)) return false;

  // 从库存扣除
  const inventory = { ...data.decorationInventory };
  inventory[decorationType] = count - 1;
  if (inventory[decorationType] <= 0) delete inventory[decorationType];
  data.decorationInventory = inventory;

  // 加入拥有列表
  data.ownedDecorations = [...data.ownedDecorations, decorationType];

  // 自动装备（槽位空闲时）
  const slot = DECORATION_SLOTS[decorationType];
  const slotOccupied = data.equippedDecorations.some(
    (d) => DECORATION_SLOTS[d as DecorationType] === slot,
  );
  if (
    !slotOccupied &&
    data.equippedDecorations.length < MAX_EQUIPPED_DECORATIONS
  ) {
    data.equippedDecorations = [...data.equippedDecorations, decorationType];
  }

  addInteractionExpWithLimit(INTERACTION_EXPERIENCE);
  debouncedSave();
  return true;
}

// 装备装饰
export function equipDecoration(decorationType: DecorationType): boolean {
  const data = attributeData.value;

  if (!data.ownedDecorations.includes(decorationType)) return false;
  if (data.equippedDecorations.includes(decorationType)) return false;
  if (data.equippedDecorations.length >= MAX_EQUIPPED_DECORATIONS) return false;

  // 检查槽位是否已被占用
  const slot = DECORATION_SLOTS[decorationType];
  const occupiedSlot = data.equippedDecorations.find(
    (d) => DECORATION_SLOTS[d as DecorationType] === slot,
  );
  if (occupiedSlot) return false;

  data.equippedDecorations = [...data.equippedDecorations, decorationType];
  debouncedSave();
  return true;
}

// 卸下装饰
export function unequipDecoration(decorationType: DecorationType): boolean {
  const data = attributeData.value;
  if (!data.equippedDecorations.includes(decorationType)) return false;

  data.equippedDecorations = data.equippedDecorations.filter(
    (d) => d !== decorationType,
  );
  debouncedSave();
  return true;
}

// 获取装饰槽位冲突信息
export function getDecorationSlotConflict(
  decorationType: DecorationType,
): string | null {
  const data = attributeData.value;
  const slot = DECORATION_SLOTS[decorationType];
  const occupied = data.equippedDecorations.find(
    (d) => DECORATION_SLOTS[d as DecorationType] === slot,
  );
  if (occupied) {
    return DECORATION_CONFIGS[occupied as DecorationType].name;
  }
  return null;
}

// 开始打工
export function startWork(workState: PetState): boolean {
  const data = attributeData.value;

  // 检查健康值
  if (data.health <= 0) return false;

  // 检查体力是否足够
  const requiredStamina = WORK_STAMINA_REQUIRED[workState] ?? 30;
  if (data.stamina < requiredStamina) return false;

  if (requestStateChange) {
    requestStateChange(workState);
  }

  return true;
}

// 打工完成回调
export function onWorkComplete(workState: PetState): void {
  const data = attributeData.value;
  const baseIncome = (WORK_INCOME[workState] ?? 0) + (data.level - 1);
  const effects = getActiveEffects(data.equippedDecorations);
  const incomeBonus = 1 + (effects.workIncomeBonus ?? 0);
  const income = Math.floor(baseIncome * incomeBonus);
  const exp = WORK_EXPERIENCE[workState] ?? 0;

  data.money += income;
  addExperience(exp);
  debouncedSave();

  // 触发金币增长特效
  coinGainAmount.value = income;
}

// 获取打工时长倍率（受装饰效果影响）
export function getWorkDurationMultiplier(): number {
  const data = attributeData.value;
  const effects = getActiveEffects(data.equippedDecorations);
  return 1 - (effects.workDurationReduction ?? 0);
}

// 带每日上限的交互经验
function addInteractionExpWithLimit(amount: number): void {
  const data = attributeData.value;
  const today = getTodayString();

  // 日期变更，重置计数
  if (data.dailyInteractionExpDate !== today) {
    data.dailyInteractionExpDate = today;
    data.dailyInteractionExp = 0;
  }

  // 检查每日上限
  const remaining = DAILY_INTERACTION_EXPERIENCE_CAP - data.dailyInteractionExp;
  if (remaining <= 0) return;

  const actual = Math.min(amount, remaining);
  data.dailyInteractionExp += actual;
  addExperience(actual);
}

// 互动经验（点击/双击时调用）
export function addInteractionExperience(): void {
  addInteractionExpWithLimit(INTERACTION_EXPERIENCE);
}

// 增加经验并检查升级
export function addExperience(amount: number): void {
  const data = attributeData.value;

  if (data.level >= MAX_LEVEL) return;

  data.experience += amount;

  // 检查升级
  while (data.level < MAX_LEVEL) {
    const required = getExpRequiredForLevel(data.level);
    if (data.experience >= required) {
      data.experience -= required;
      data.level++;
      // 升级时触发庆祝
      if (requestStateChange) {
        requestStateChange("celebrate");
      }
    } else {
      break;
    }
  }

  // 满级时经验清零
  if (data.level >= MAX_LEVEL) {
    data.experience = 0;
  }

  debouncedSave();
}

// 获取健康状态（供 petController 使用）
export function getHealthStatus(): "happy" | "sick" | "normal" {
  const health = attributeData.value.health;
  if (health >= HEALTH_HAPPY_THRESHOLD) return "happy";
  if (health < HEALTH_SICK_THRESHOLD) return "sick";
  return "normal";
}

// 检查是否可以打工
export function canWork(): boolean {
  const data = attributeData.value;
  return data.health > 0;
}

// 获取当前体力能够胜任的工作列表（不触发状态变更）
export function getAffordableWorkStates(
  workStates: readonly PetState[],
): PetState[] {
  const data = attributeData.value;
  if (data.health <= 0) return [];
  return workStates.filter(
    (w) => data.stamina >= (WORK_STAMINA_REQUIRED[w] ?? 30),
  );
}

// 调试面板：直接设置属性值（绕过检查）
export function debugSetAttribute(
  key: keyof AttributeData,
  value: number,
): void {
  const data = attributeData.value;
  if (key in data && typeof value === "number") {
    (data as any)[key] = value;
    debouncedSave();
  }
}

// 可见性变化处理
function handleVisibilityChange(): void {
  if (document.visibilityState === "hidden") {
    // 切到后台：暂停计时器，立即保存
    stopTimers();
    flushSave();
  } else {
    // 切回前台：恢复计时器（不补偿离线时间）
    startTimers();
  }
}

// 启动计时器
function startTimers(): void {
  // 每秒 tick
  tickTimer = setInterval(tick, 1000);
}

// 停止计时器
function stopTimers(): void {
  if (tickTimer) {
    clearInterval(tickTimer);
    tickTimer = null;
  }
}

// 初始化属性系统
export function initAttributes(): void {
  // 加载数据
  attributeData.value = loadAttributeData();

  // 启动时检查救济金（首次打开或跨天重启时）
  checkDailyAllowance();

  // 初始化心情值
  updateMood();

  // 启动计时器
  startTimers();

  // 监听可见性变化
  document.addEventListener("visibilitychange", handleVisibilityChange);
}

// 检查并发放每日救济金
function checkDailyAllowance(): void {
  const data = attributeData.value;
  const today = getTodayString();
  if (
    data.dailyAllowanceClaimed !== today &&
    data.money < DAILY_ALLOWANCE_THRESHOLD
  ) {
    data.money += DAILY_ALLOWANCE;
    data.dailyAllowanceClaimed = today;
  }
}

// 清理属性系统
export function cleanupAttributes(): void {
  stopTimers();
  flushSave();
  document.removeEventListener("visibilitychange", handleVisibilityChange);
}
