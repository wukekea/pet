<script setup lang="ts">
// 极简徽章特效 - 单 emoji/文字 + 单动画的通用组件
// 合并原 Hello/Grin/Peek/Sneeze/Scratch/Sleepy/Yawn/Stretch/
// Sleepwalking 九个结构一致的组件，由 effectsMap 配置驱动
const props = defineProps<{
  /** 内容：emoji 或文字 */
  content: string;
  /** 可选的第二行文字（如喷嚏的"阿嚏!"） */
  subText?: string;
  /** 根容器定位，直接拼进 style（如 "top: -20px; right: -25px;"） */
  position: string;
  /** 字号（px），emoji 类默认 24 */
  fontSize?: number;
  /** 文字颜色（content 为文字时使用） */
  color?: string;
  /** 动画名，见 shared.css 与本文件的 fx-badge-* keyframes */
  animation: string;
}>();
</script>

<template>
  <div
    class="badge-effect effect-badge"
    :class="{ 'has-sub': !!props.subText }"
    :style="props.position"
  >
    <span
      class="badge-content"
      :style="{
        fontSize: (props.fontSize ?? 24) + 'px',
        color: props.color,
        animation: props.animation,
      }"
    >
      {{ props.content }}
    </span>
    <span v-if="props.subText" class="badge-sub-text">{{ props.subText }}</span>
  </div>
</template>

<style scoped>
@import "./shared.css";

/* 纵向排列（带副文字时） */
.badge-effect.has-sub {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.badge-content {
  display: block;
  line-height: 1;
}

.badge-sub-text {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
}
</style>

<!-- 全局（非 scoped）动画库。
     keyframes 不能放在上面的 scoped 块：scoped 会给 keyframes 名加
     hash 后缀且只改写同块内的 CSS animation 声明，而本组件的动画名
     由 effectsMap 通过 props 传成内联 style，编译器无法跟随改名，
     导致动画静默失效。全局定义 + fx-badge- 前缀保证名字稳定唯一。 -->
<style>
/* ===== 徽章动画库 =====
   合并原九个组件的同构 keyframes：
   wave-animation / grin-float / peek-shy / sneeze-puff /
   scratch-bounce / sleepy-float / yawn-float / stretch-sparkle /
   sleepwalking-sparkle */

/* 挥手（原 wave-animation） */
@keyframes fx-badge-wave {
  0%,
  100% {
    transform: rotate(-10deg);
  }
  50% {
    transform: rotate(20deg);
  }
}

/* 上下浮动（原 grin-float / yawn-float / sleepwalking-sparkle 家族），
   通过 --fx-badge-rise 控制上浮幅度 */
@keyframes fx-badge-float {
  0%,
  100% {
    transform: translateY(0);
    opacity: var(--fx-badge-dim-opacity, 0.8);
  }
  50% {
    transform: translateY(var(--fx-badge-rise, -5px));
    opacity: 1;
  }
}

/* 浮动+缩放（原 peek-shy / sleepy-float） */
@keyframes fx-badge-float-scale {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: var(--fx-badge-dim-opacity, 0.7);
  }
  50% {
    transform: translateY(var(--fx-badge-rise, -5px))
      scale(var(--fx-badge-scale, 1.1));
    opacity: 1;
  }
}

/* 快速弹跳（原 scratch-bounce，无透明度变化） */
@keyframes fx-badge-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(var(--fx-badge-rise, -5px));
  }
}

/* 喷气/脉冲（原 sneeze-puff） */
@keyframes fx-badge-puff {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
}

/* 单次闪现渐隐（原 stretch-sparkle） */
@keyframes fx-badge-sparkle {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  30% {
    transform: scale(1.2);
    opacity: 1;
  }
  70% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0;
  }
}
</style>
