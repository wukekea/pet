<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, watch } from "vue";
import { getFootprintOpacity } from "./composables/useFootprints";
// 状态变量从 sharedState 导入
import {
  petState,
  petDirection,
  position,
  isVisible,
  isDragging,
} from "./composables/sharedState";
// 函数从 usePetState 导入
import {
  handleDragStart,
  handlePetClick,
  handlePetDoubleClick,
  togglePet,
  initScreenSize,
  initPet,
  cleanupPet,
} from "./composables/usePetState";
import { footprints } from "./composables/useFootprints";
import { dialogueText, isDialogueVisible } from "./composables/useDialogue";
import { isDark, checkSystemTheme } from "./composables/useTheme";
import "./styles.css";

// Electron API 类型声明
declare global {
  interface Window {
    electronAPI?: {
      setIgnoreMouseEvents: (ignore: boolean) => void;
      getScreenSize: () => Promise<{ width: number; height: number }>;
    };
  }
}

// 宠物颜色 - 根据主题变化
const petColors = computed(() => {
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

// 初始化
onMounted(async () => {
  // 初始化屏幕尺寸
  await initScreenSize();

  // 初始化宠物
  initPet(checkSystemTheme);
});

// 清理
onBeforeUnmount(() => {
  cleanupPet();
});

// 监听可见性变化，保存到存储
watch(isVisible, (value) => {
  localStorage.setItem("pet-visibility", String(value));
});

// 暴露方法供外部调用
defineExpose({
  togglePet,
  isVisible,
});
</script>

<template>
  <div
    v-if="isVisible"
    class="desktop-pet"
    :class="[`pet-${petState}`, `pet-${petDirection}`]"
  >
    <!-- 脚印容器 -->
    <div class="footprints-container">
      <div
        v-for="footprint in footprints"
        :key="footprint.id"
        class="footprint"
        :class="[
          footprint.isLeft ? 'footprint-left' : 'footprint-right',
          `footprint-${footprint.direction}`,
        ]"
        :style="{
          left: `${footprint.x}px`,
          top: `${footprint.y}px`,
          opacity: getFootprintOpacity(footprint),
        }"
      >
        <svg viewBox="0 0 24 24" class="footprint-svg">
          <path
            d="M12 2C9.5 2 7.5 4.5 7.5 7.5C7.5 10.5 9.5 13 12 13C14.5 13 16.5 10.5 16.5 7.5C16.5 4.5 14.5 2 12 2Z"
            fill="currentColor"
          />
          <ellipse cx="7" cy="17" rx="3" ry="2" fill="currentColor" />
          <ellipse cx="12" cy="19" rx="3.5" ry="2.5" fill="currentColor" />
          <ellipse cx="17" cy="17" rx="3" ry="2" fill="currentColor" />
        </svg>
      </div>
    </div>

    <!-- 宠物容器 -->
    <div
      class="pet-container"
      :class="{ 'is-dragging': isDragging }"
      :style="{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }"
      @mousedown="handleDragStart"
      @click="handlePetClick"
      @dblclick="handlePetDoubleClick"
      title="拖动：移动位置 | 单击：互动 | 双击：跳舞/翻滚"
    >
      <!-- 阴影 -->
      <div class="pet-shadow"></div>

      <!-- 宠物主体 -->
      <div class="pet-body">
        <!-- 身体渐变 -->
        <div class="pet-body-gradient"></div>

        <!-- 耳朵 -->
        <div class="pet-ear ear-left"></div>
        <div class="pet-ear ear-right"></div>

        <!-- 脸部 -->
        <div class="pet-face">
          <!-- 眉毛（生气时显示） -->
          <div class="pet-brows">
            <div class="brow brow-left"></div>
            <div class="brow brow-right"></div>
          </div>

          <!-- 眼睛 -->
          <div class="pet-eyes">
            <div class="eye eye-left">
              <div class="eye-shine"></div>
            </div>
            <div class="eye eye-right">
              <div class="eye-shine"></div>
            </div>
          </div>

          <!-- 眨眼效果 -->
          <div class="pet-eyes blink">
            <div class="eye eye-left eye-closed"></div>
            <div class="eye eye-right eye-closed"></div>
          </div>

          <!-- 嘴巴 -->
          <div class="pet-mouth">
            <div class="mouth-smile"></div>
            <div class="mouth-o"></div>
            <div class="mouth-sad"></div>
            <div class="mouth-angry"></div>
          </div>

          <!-- 腮红 -->
          <div class="pet-cheek cheek-left"></div>
          <div class="pet-cheek cheek-right"></div>

          <!-- 眼泪（大哭时显示） -->
          <div class="tears" v-if="petState === 'crying'">
            <div class="tear tear-left"></div>
            <div class="tear tear-right"></div>
          </div>
        </div>

        <!-- 手臂 -->
        <div class="pet-arm arm-left"></div>
        <div class="pet-arm arm-right"></div>

        <!-- 腿 -->
        <div class="pet-leg leg-left"></div>
        <div class="pet-leg leg-right"></div>
      </div>

      <!-- 睡眠气泡 -->
      <div class="sleep-bubble" v-if="petState === 'sleeping'">
        <span>Z</span>
        <span class="z2">Z</span>
        <span class="z3">Z</span>
      </div>

      <!-- 开心效果 -->
      <div class="happy-effects" v-if="petState === 'happy'">
        <div class="heart heart-1">❤️</div>
        <div class="heart heart-2">✨</div>
        <div class="heart heart-3">💖</div>
      </div>

      <!-- 晕眩效果（摔倒时显示） -->
      <div class="dizzy-effects" v-if="petState === 'fallen'">
        <span class="dizzy-star">⭐</span>
        <span class="dizzy-star star-2">💫</span>
        <span class="dizzy-star star-3">✴️</span>
      </div>

      <!-- 惊吓效果 -->
      <div class="scared-effects" v-if="petState === 'scared'">
        <span class="exclaim">❗</span>
        <span class="exclaim exclaim-2">❗</span>
      </div>

      <!-- 思考效果 -->
      <div class="thinking-effects" v-if="petState === 'thinking'">
        <span class="think-icon">💭</span>
      </div>

      <!-- 得意效果 -->
      <div class="smug-effects" v-if="petState === 'smug'">
        <span class="thumb-up">👍</span>
      </div>

      <!-- 害羞效果 -->
      <div class="shy-effects" v-if="petState === 'shy'">
        <span class="shy-icon">🫣</span>
      </div>

      <!-- 疑惑效果 -->
      <div class="confused-effects" v-if="petState === 'confused'">
        <span class="confused-icon">🤔</span>
      </div>

      <!-- 打招呼效果 -->
      <div class="hello-effects" v-if="petState === 'hello'">
        <span class="wave">👋</span>
      </div>

      <!-- 打喷嚏效果 -->
      <div class="sneeze-effects" v-if="petState === 'sneeze'">
        <span class="sneeze-cloud">💨</span>
        <span class="sneeze-text">阿嚏!</span>
      </div>

      <!-- 坏笑效果 -->
      <div class="grin-effects" v-if="petState === 'grin'">
        <span class="grin-text">嘿嘿~</span>
      </div>

      <!-- 挠头效果 -->
      <div class="scratch-effects" v-if="petState === 'scratch'">
        <span class="scratch-icon">❓</span>
      </div>

      <!-- 跳跃庆祝效果 -->
      <div class="celebrate-effects" v-if="petState === 'celebrate'">
        <span class="confetti">🎉</span>
        <span class="confetti confetti-2">🎊</span>
        <span class="confetti confetti-3">✨</span>
      </div>

      <!-- 嬉戏庆祝效果 -->
      <div class="celebrate-effects" v-if="petState === 'celebrate'">
        <span class="confetti">🎉</span>
        <span class="confetti confetti-2">🎊</span>
        <span class="confetti confetti-3">✨</span>
      </div>

      <!-- 偷看效果 -->
      <div class="peek-effects" v-if="petState === 'peek'">
        <span class="peek-icon">🤫</span>
      </div>

      <!-- 跳舞效果 -->
      <div class="dancing-effects" v-if="petState === 'dancing'">
        <span class="music-note">🎵</span>
        <span class="music-note note-2">🎶</span>
        <span class="music-note note-3">💃</span>
      </div>

      <!-- 翻滚效果 -->
      <div class="rolling-effects" v-if="petState === 'rolling'">
        <span class="spin-star">⭐</span>
      </div>
    </div>

    <!-- 对话气泡（放在 pet-container 外部，不受翻滚影响） -->
    <div
      class="dialogue-bubble"
      :class="{
        'dialogue-visible': isDialogueVisible,
        'dialogue-left': petDirection === 'left',
      }"
      :style="{
        left: `${position.x + 40}px`,
        top: `${position.y - 55}px`,
      }"
      v-if="dialogueText"
    >
      <span class="dialogue-text">{{ dialogueText }}</span>
      <div class="dialogue-tail"></div>
    </div>
  </div>
</template>

<style scoped>
/* 动态颜色绑定 - 需要使用 v-bind */
.footprint-svg {
  color: v-bind("petColors.footprint");
}

.pet-shadow {
  background: v-bind("petColors.shadow");
}

.pet-body {
  background: v-bind("petColors.body");
}

.pet-body-gradient {
  background: radial-gradient(
    circle at 30% 30%,
    v-bind("petColors.bodyGradient"),
    transparent 60%
  );
}

.pet-ear {
  background: v-bind("petColors.body");
}

.pet-ear::after {
  background: v-bind("petColors.bodyGradient");
}

.brow {
  background: v-bind("petColors.eyes");
}

.eye {
  background: v-bind("petColors.eyes");
}

.eye-closed {
  background: v-bind("petColors.eyes");
}

.mouth-smile {
  border-bottom: 3px solid v-bind("petColors.eyes");
}

.mouth-o {
  border: 3px solid v-bind("petColors.eyes");
}

.mouth-sad {
  border-top: 3px solid v-bind("petColors.eyes");
}

.mouth-angry {
  border: 3px solid v-bind("petColors.eyes");
}

.pet-cheek {
  background: v-bind("petColors.cheeks");
}

.pet-arm {
  background: v-bind("petColors.body");
}

.pet-leg {
  background: v-bind("petColors.body");
}

.pet-scared .brow-left {
  transform: translateY(-2px) rotate(-10deg);
}

.pet-scared .brow-right {
  transform: translateY(-2px) rotate(10deg);
}

.pet-scared .mouth-smile {
  border: 3px solid v-bind("petColors.eyes");
}

.pet-sneeze .mouth-smile {
  border: 3px solid v-bind("petColors.eyes");
}

.dialogue-bubble {
  background: v-bind(
    "isDark ? 'rgba(30, 30, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)'"
  );
  box-shadow:
    0 4px 15px
      v-bind("isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(139, 92, 246, 0.15)'"),
    0 0 0 1px
      v-bind("isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(139, 92, 246, 0.1)'");
}

.dialogue-bubble::before {
  background: linear-gradient(
    135deg,
    v-bind("isDark ? 'rgba(167, 139, 250, 0.3)' : 'rgba(139, 92, 246, 0.2)'"),
    v-bind("isDark ? 'rgba(244, 114, 182, 0.3)' : 'rgba(253, 164, 175, 0.2)'")
  );
}

.dialogue-text {
  color: v-bind("isDark ? '#e2e8f0' : '#374151'");
  text-shadow: 0 1px 2px
    v-bind("isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.5)'");
}

.dialogue-tail {
  background: v-bind(
    "isDark ? 'rgba(30, 30, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)'"
  );
}
</style>
