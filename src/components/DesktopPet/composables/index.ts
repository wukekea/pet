// 宠物状态管理 - 统一的 composable
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import type { PetState, PetDirection, PetPosition, Footprint } from "../types";
import {
  PET_SIZE,
  IDLE_DURATION,
  SLEEP_DURATION,
  HAPPY_DURATION,
  JUMP_DURATION,
  CRYING_DURATION,
  ANGRY_DURATION,
  FALLEN_DURATION,
  SCARED_DURATION,
  THINKING_DURATION,
  SMUG_DURATION,
  SHY_DURATION,
  CONFUSED_DURATION,
  HELLO_DURATION,
  SNEEZE_DURATION,
  YAWN_DURATION,
  SCRATCH_DURATION,
  CELEBRATE_DURATION,
  PEEK_DURATION,
  CHASE_DURATION,
  HIDE_DURATION,
  WALK_SPEED,
  FOOTPRINT_INTERVAL,
  FOOTPRINT_LIFETIME,
  MAX_FOOTPRINTS,
} from "../constants";
import { dialogueMessages } from "../dialogues";

// ========================================
// 共享状态
// ========================================

// 鼠标位置（用于追逐）
export const mousePosition = ref<PetPosition>({ x: 0, y: 0 });

// 宠物状态
export const petState = ref<PetState>("idle");
export const petDirection = ref<PetDirection>("right");
export const position = ref<PetPosition>({ x: 50, y: window.innerHeight - 120 });
export const targetPosition = ref<PetPosition>({ x: 50, y: window.innerHeight - 120 });
export const stateTimer = ref<number | null>(null);
export const screenSize = ref({ width: window.innerWidth, height: window.innerHeight });
export const isVisible = ref(true);
export const animationFrameId = ref<number | null>(null);
export const isDragging = ref(false);
export const dragOffset = ref<PetPosition>({ x: 0, y: 0 });

// 脚印状态
export const footprints = ref<Footprint[]>([]);
export const lastFootprintTime = ref(0);
export const lastFootprintWasLeft = ref(false);
export const footprintIdCounter = ref(0);

// 对话气泡状态
export const dialogueText = ref<string | null>(null);
export const dialogueTimer = ref<number | null>(null);
export const isDialogueVisible = ref(false);

// 主题状态
export const isDark = ref(false);

// 当前穿透状态
let isPassthrough = true;

// ========================================
// 主题相关
// ========================================

export function checkSystemTheme() {
  isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export const petColors = computed(() => {
  const isAngry = petState.value === "angry";
  return {
    body: isAngry ? "#ef4444" : isDark.value ? "#a78bfa" : "#8b5cf6",
    bodyGradient: isAngry ? "#f87171" : isDark.value ? "#c4b5fd" : "#a78bfa",
    face: isDark.value ? "#1f2937" : "#ffffff",
    eyes: isDark.value ? "#fbbf24" : "#1f2937",
    cheeks: isDark.value ? "#f472b6" : "#fda4af",
    shadow: isDark.value
      ? "rgba(167, 139, 250, 0.3)"
      : "rgba(139, 92, 246, 0.2)",
    footprint: isDark.value
      ? "rgba(167, 139, 250, 0.4)"
      : "rgba(139, 92, 246, 0.3)",
    angryFace: "#7f1d1d",
  };
});

// ========================================
// 脚印相关
// ========================================

export function addFootprint(x: number, y: number, direction: PetDirection) {
  const now = Date.now();
  if (now - lastFootprintTime.value < FOOTPRINT_INTERVAL) return;

  lastFootprintTime.value = now;
  lastFootprintWasLeft.value = !lastFootprintWasLeft.value;

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

  if (footprints.value.length > MAX_FOOTPRINTS) {
    footprints.value.shift();
  }
}

export function cleanupFootprints() {
  const now = Date.now();
  footprints.value = footprints.value.filter(
    (fp) => now - fp.createdAt < FOOTPRINT_LIFETIME
  );
}

export function getFootprintOpacity(footprint: Footprint): number {
  const age = Date.now() - footprint.createdAt;
  const remaining = FOOTPRINT_LIFETIME - age;
  return Math.max(0, remaining / FOOTPRINT_LIFETIME);
}

// ========================================
// 对话气泡相关
// ========================================

export function showDialogue() {
  if (isDialogueVisible.value || isDragging.value) return;
  if (Math.random() > 0.3) return;

  const messages = dialogueMessages[petState.value] || dialogueMessages.idle;
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  dialogueText.value = randomMessage;
  isDialogueVisible.value = true;

  if (dialogueTimer.value) {
    clearTimeout(dialogueTimer.value);
  }

  dialogueTimer.value = window.setTimeout(() => {
    hideDialogue();
  }, 3000);
}

export function hideDialogue() {
  isDialogueVisible.value = false;
  setTimeout(() => {
    if (!isDialogueVisible.value) {
      dialogueText.value = null;
    }
  }, 300);
}

// ========================================
// 宠物状态相关
// ========================================

export function setPassthrough(ignore: boolean) {
  if (ignore !== isPassthrough) {
    if (window.electronAPI) {
      window.electronAPI.setIgnoreMouseEvents(ignore);
      isPassthrough = ignore;
    }
  }
}

export function isMouseOnPet(x: number, y: number): boolean {
  const petX = position.value.x;
  const petY = position.value.y;
  const petCenterX = petX + PET_SIZE / 2;
  const petCenterY = petY + PET_SIZE / 2;
  const distance = Math.sqrt((x - petCenterX) ** 2 + (y - petCenterY) ** 2);
  return distance < PET_SIZE / 2 + 15;
}

const NON_MOVING_STATES: PetState[] = [
  "sleeping",
  "happy",
  "crying",
  "angry",
  "fallen",
  "scared",
  "thinking",
  "smug",
  "shy",
  "confused",
  "hello",
  "sneeze",
  "yawn",
  "scratch",
  "celebrate",
  "peek",
  "chase",
  "hide",
];

export function moveToRandomPosition() {
  if (NON_MOVING_STATES.includes(petState.value)) return;

  const maxX = screenSize.value.width - PET_SIZE;
  const maxY = screenSize.value.height - PET_SIZE - 20;

  targetPosition.value = {
    x: Math.random() * maxX,
    y: Math.random() * (maxY - 100) + 100,
  };

  petDirection.value =
    targetPosition.value.x > position.value.x ? "right" : "left";

  petState.value = "walking";
}

export function changeState(newState: PetState) {
  petState.value = newState;

  showDialogue();

  if (stateTimer.value) {
    clearTimeout(stateTimer.value);
  }

  switch (newState) {
    case "idle":
      stateTimer.value = window.setTimeout(() => {
        if (!isDragging.value) {
          const random = Math.random();
          if (random < 0.08) changeState("sleeping");
          else if (random < 0.15) changeState("jumping");
          else if (random < 0.2) changeState("crying");
          else if (random < 0.25) changeState("angry");
          else if (random < 0.3) changeState("fallen");
          else if (random < 0.35) changeState("scared");
          else if (random < 0.4) changeState("thinking");
          else if (random < 0.45) changeState("smug");
          else if (random < 0.5) changeState("shy");
          else if (random < 0.55) changeState("confused");
          else if (random < 0.6) changeState("hello");
          else if (random < 0.65) changeState("sneeze");
          else if (random < 0.7) changeState("yawn");
          else if (random < 0.75) changeState("scratch");
          else if (random < 0.8) changeState("celebrate");
          else if (random < 0.85) changeState("peek");
          else moveToRandomPosition();
        }
      }, IDLE_DURATION);
      break;
    case "sleeping":
      stateTimer.value = window.setTimeout(() => changeState("idle"), SLEEP_DURATION);
      break;
    case "jumping":
      setTimeout(() => changeState("idle"), JUMP_DURATION);
      break;
    case "happy":
      stateTimer.value = window.setTimeout(() => changeState("idle"), HAPPY_DURATION);
      break;
    case "crying":
      stateTimer.value = window.setTimeout(() => changeState("idle"), CRYING_DURATION);
      break;
    case "angry":
      stateTimer.value = window.setTimeout(() => changeState("idle"), ANGRY_DURATION);
      break;
    case "fallen":
      setTimeout(() => changeState("idle"), FALLEN_DURATION);
      break;
    case "scared":
      stateTimer.value = window.setTimeout(() => changeState("idle"), SCARED_DURATION);
      break;
    case "thinking":
      stateTimer.value = window.setTimeout(() => changeState("idle"), THINKING_DURATION);
      break;
    case "smug":
      stateTimer.value = window.setTimeout(() => changeState("idle"), SMUG_DURATION);
      break;
    case "shy":
      stateTimer.value = window.setTimeout(() => changeState("idle"), SHY_DURATION);
      break;
    case "confused":
      stateTimer.value = window.setTimeout(() => changeState("idle"), CONFUSED_DURATION);
      break;
    case "hello":
      stateTimer.value = window.setTimeout(() => changeState("idle"), HELLO_DURATION);
      break;
    case "sneeze":
      setTimeout(() => changeState("idle"), SNEEZE_DURATION);
      break;
    case "yawn":
      stateTimer.value = window.setTimeout(() => changeState("idle"), YAWN_DURATION);
      break;
    case "scratch":
      stateTimer.value = window.setTimeout(() => changeState("idle"), SCRATCH_DURATION);
      break;
    case "celebrate":
      stateTimer.value = window.setTimeout(() => changeState("idle"), CELEBRATE_DURATION);
      break;
    case "peek":
      stateTimer.value = window.setTimeout(() => changeState("idle"), PEEK_DURATION);
      break;
    case "chase":
      stateTimer.value = window.setTimeout(() => changeState("idle"), CHASE_DURATION);
      break;
    case "hide":
      stateTimer.value = window.setTimeout(() => changeState("idle"), HIDE_DURATION);
      break;
  }
}

export function animate() {
  cleanupFootprints();

  if (petState.value === "chase" && isVisible.value) {
    const dx = mousePosition.value.x - position.value.x - PET_SIZE / 2;
    const dy = mousePosition.value.y - position.value.y - PET_SIZE / 2;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
      const speed = 3;
      const ratio = speed / distance;
      position.value.x += dx * ratio;
      position.value.y += dy * ratio;

      petDirection.value = dx > 0 ? "right" : "left";
      addFootprint(position.value.x, position.value.y, petDirection.value);
    }
  }

  if (isVisible.value && petState.value !== "chase") {
    const dx = targetPosition.value.x - position.value.x;
    const dy = targetPosition.value.y - position.value.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > WALK_SPEED && petState.value === "walking" && !isDragging.value) {
      const ratio = WALK_SPEED / distance;
      position.value.x += dx * ratio;
      position.value.y += dy * ratio;

      petDirection.value = dx > 0 ? "right" : "left";
      addFootprint(position.value.x, position.value.y, petDirection.value);
    } else if (distance <= WALK_SPEED && petState.value === "walking" && !isDragging.value) {
      position.value.x = targetPosition.value.x;
      position.value.y = targetPosition.value.y;
      changeState("idle");
    }
  }

  animationFrameId.value = requestAnimationFrame(animate);
}

export function togglePet() {
  isVisible.value = !isVisible.value;
  if (!isVisible.value) {
    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value);
    }
    if (stateTimer.value) {
      clearTimeout(stateTimer.value);
    }
  } else {
    animate();
    changeState("idle");
  }
}

export function handleResize() {
  screenSize.value = { width: window.innerWidth, height: window.innerHeight };

  const maxX = screenSize.value.width - PET_SIZE;
  const maxY = screenSize.value.height - PET_SIZE - 20;

  if (position.value.x > maxX) position.value.x = maxX;
  if (position.value.y > maxY) position.value.y = maxY;
}

export async function initScreenSize() {
  if (window.electronAPI) {
    try {
      const size = await window.electronAPI.getScreenSize();
      screenSize.value = size;
      position.value = { x: 50, y: size.height - 120 };
      targetPosition.value = { x: 50, y: size.height - 120 };
    } catch (e) {
      console.log("使用默认屏幕尺寸");
    }
  }
}

export function handleMouseMove(e: MouseEvent) {
  mousePosition.value = { x: e.clientX, y: e.clientY };
  const onPet = isMouseOnPet(e.clientX, e.clientY);
  setPassthrough(!onPet);
}

export function handlePetClick() {
  if (isDragging.value) return;

  if (petState.value !== "sleeping") {
    const reactions: PetState[] = ["happy", "scared", "fallen", "smug", "shy", "celebrate"];
    changeState(reactions[Math.floor(Math.random() * reactions.length)]);
  }
}

export function handleDragStart(e: MouseEvent) {
  isDragging.value = true;
  setPassthrough(false);

  dragOffset.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y,
  };

  if (stateTimer.value) {
    clearTimeout(stateTimer.value);
  }

  petState.value = "walking";

  window.addEventListener("mousemove", handleDragging);
  window.addEventListener("mouseup", handleDragEnd);
}

function handleDragging(e: MouseEvent) {
  if (!isDragging.value || !isVisible.value) return;

  const mouseX = e.clientX;
  const mouseY = e.clientY;

  petDirection.value = mouseX > position.value.x ? "right" : "left";

  position.value = {
    x: mouseX - dragOffset.value.x,
    y: mouseY - dragOffset.value.y,
  };

  addFootprint(position.value.x, position.value.y, petDirection.value);
  targetPosition.value = { ...position.value };

  const maxX = screenSize.value.width - PET_SIZE;
  const maxY = screenSize.value.height - PET_SIZE - 20;

  if (position.value.x < 0) position.value.x = 0;
  if (position.value.x > maxX) position.value.x = maxX;
  if (position.value.y < 60) position.value.y = 60;
  if (position.value.y > maxY) position.value.y = maxY;
}

function handleDragEnd() {
  if (!isDragging.value) return;

  isDragging.value = false;
  targetPosition.value = { ...position.value };

  window.removeEventListener("mousemove", handleDragging);
  window.removeEventListener("mouseup", handleDragEnd);

  changeState("idle");
}

// ========================================
// 初始化和清理
// ========================================

export function initPet() {
  checkSystemTheme();
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", checkSystemTheme);

  const savedState = localStorage.getItem("pet-visibility");
  if (savedState !== null) {
    isVisible.value = savedState === "true";
  }

  if (isVisible.value) {
    animate();
    setTimeout(() => {
      changeState("idle");
    }, 1000);
  }

  window.addEventListener("resize", handleResize);
  window.addEventListener("mousemove", handleMouseMove);

  (window as any).togglePet = togglePet;
}

export function cleanupPet() {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value);
  }
  if (stateTimer.value) {
    clearTimeout(stateTimer.value);
  }
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("mousemove", handleMouseMove);
}
