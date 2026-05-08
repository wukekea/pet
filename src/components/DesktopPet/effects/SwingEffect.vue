<script setup lang="ts">
/**
 * 秋千效果组件
 * 简洁版 - 只保留绳子和座椅
 */
</script>

<template>
  <div class="swing-container">
    <svg
      class="swing-svg"
      viewBox="0 0 240 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <!-- 木质渐变 -->
        <linearGradient id="woodGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#8B5A2B" />
          <stop offset="30%" stop-color="#A0522D" />
          <stop offset="50%" stop-color="#CD853F" />
          <stop offset="70%" stop-color="#A0522D" />
          <stop offset="100%" stop-color="#8B5A2B" />
        </linearGradient>

        <!-- 绳索渐变 -->
        <linearGradient id="ropeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#D4A574" />
          <stop offset="50%" stop-color="#E8C49A" />
          <stop offset="100%" stop-color="#D4A574" />
        </linearGradient>
      </defs>

      <!-- 秋千摇摆部分 -->
      <g class="swing-body">
        <!-- 左绳 -->
        <line
          x1="64"
          y1="0"
          x2="65"
          y2="170"
          stroke="url(#ropeGradient)"
          stroke-width="4"
          stroke-linecap="round"
        />
        <circle cx="64" cy="0" r="5" fill="#D4A574" />
        <circle cx="65" cy="170" r="4" fill="#C4946A" />

        <!-- 右绳 -->
        <line
          x1="174"
          y1="0"
          x2="175"
          y2="170"
          stroke="url(#ropeGradient)"
          stroke-width="4"
          stroke-linecap="round"
        />
        <circle cx="174" cy="0" r="5" fill="#D4A574" />
        <circle cx="175" cy="170" r="4" fill="#C4946A" />

        <!-- 座板 -->
        <rect
          x="50"
          y="170"
          width="140"
          height="12"
          rx="5"
          fill="url(#woodGradient)"
        />
        <!-- 木纹 -->
        <line
          x1="60"
          y1="169"
          x2="100"
          y2="169"
          stroke="#6D4C41"
          stroke-width="1"
          opacity="0.3"
        />
        <line
          x1="110"
          y1="169"
          x2="160"
          y2="169"
          stroke="#6D4C41"
          stroke-width="1"
          opacity="0.3"
        />
        <line
          x1="170"
          y1="169"
          x2="180"
          y2="169"
          stroke="#6D4C41"
          stroke-width="1"
          opacity="0.3"
        />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.swing-container {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 280px;
  height: 250px;
  pointer-events: auto;
  z-index: -1;
}

.swing-svg {
  width: 100%;
  height: 100%;
}

/* 秋千本身不单独摇晃，由父容器 .pet-container.is-swinging 控制整体摇晃 */
</style>
