<script setup lang="ts">
// 打喷嚏效果组件
</script>

<template>
  <div class="sneeze-effects">
    <span class="sneeze-cloud">💨</span>
    <span class="sneeze-text">阿嚏!</span>
  </div>
</template>

<style scoped>
.sneeze-effects {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.sneeze-cloud {
  display: block;
  animation: sneeze-puff 0.5s ease-out infinite;
}

.sneeze-text {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
}

@keyframes sneeze-puff {
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
</style>
