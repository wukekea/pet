<script setup lang="ts">
import { computed } from "vue";
import { currentWeather } from "./composables/useWeather";
import { isDark } from "./composables/useTheme";
import { position } from "./composables/sharedState";
import "./weather.css";

// 天气背景样式类
const weatherClass = computed(() => `weather-${currentWeather.value}`);
const themeClass = computed(() =>
  isDark.value ? "dark-theme" : "light-theme",
);

// 天气背景位置 - 跟随宠物位置，居中显示
const weatherStyle = computed(() => ({
  left: `${position.value.x + 40}px`,
  top: `${position.value.y + 40}px`,
}));
</script>

<template>
  <div
    class="weather-background"
    :class="[weatherClass, themeClass]"
    :style="weatherStyle"
  >
    <!-- 晴天效果 -->
    <div v-if="currentWeather === 'sunny'" class="sunny-container">
      <!-- 太阳 -->
      <div class="sun">
        <div class="sun-core"></div>
        <div class="sun-rays">
          <span
            v-for="i in 8"
            :key="i"
            class="ray"
            :style="{ '--i': i }"
          ></span>
        </div>
      </div>
      <!-- 光斑粒子 -->
      <div class="light-particles">
        <span
          v-for="i in 8"
          :key="i"
          class="particle"
          :style="{ '--i': i }"
        ></span>
      </div>
    </div>

    <!-- 多云效果 -->
    <div v-if="currentWeather === 'cloudy'" class="cloudy-container">
      <div class="clouds">
        <div v-for="i in 5" :key="i" class="cloud" :class="`cloud-${i}`"></div>
      </div>
    </div>

    <!-- 小雨效果 -->
    <div
      v-if="currentWeather === 'lightRain'"
      class="rain-container light-rain"
    >
      <div class="rain-drops">
        <span
          v-for="i in 25"
          :key="i"
          class="rain-drop"
          :style="{ '--i': i }"
        ></span>
      </div>
    </div>

    <!-- 暴雨效果 -->
    <div
      v-if="currentWeather === 'heavyRain'"
      class="rain-container heavy-rain"
    >
      <div class="rain-drops">
        <span
          v-for="i in 50"
          :key="i"
          class="rain-drop heavy"
          :style="{ '--i': i }"
        ></span>
      </div>
      <div class="rain-overlay"></div>
    </div>

    <!-- 雷阵雨效果 -->
    <div
      v-if="currentWeather === 'thunderstorm'"
      class="rain-container thunderstorm"
    >
      <div class="rain-drops">
        <span
          v-for="i in 40"
          :key="i"
          class="rain-drop thunder"
          :style="{ '--i': i }"
        ></span>
      </div>
      <div class="lightning">
        <div class="lightning-bolt"></div>
      </div>
    </div>

    <!-- 小雪效果 -->
    <div
      v-if="currentWeather === 'lightSnow'"
      class="snow-container light-snow"
    >
      <div class="snowflakes">
        <span
          v-for="i in 20"
          :key="i"
          class="snowflake"
          :style="{ '--i': i }"
        ></span>
      </div>
    </div>

    <!-- 大雪效果 -->
    <div
      v-if="currentWeather === 'heavySnow'"
      class="snow-container heavy-snow"
    >
      <div class="snowflakes">
        <span
          v-for="i in 50"
          :key="i"
          class="snowflake heavy"
          :style="{ '--i': i }"
        ></span>
      </div>
      <div class="snow-overlay"></div>
    </div>
  </div>
</template>
