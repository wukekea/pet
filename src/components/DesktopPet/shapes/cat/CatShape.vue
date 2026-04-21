<script setup lang="ts">
import type { PetState, PetDirection } from "../../types";

// Props
defineProps<{
  petState: PetState;
  petDirection: PetDirection;
}>();
</script>

<template>
  <!-- 宠物主体 -->
  <div class="pet-body">
    <!-- 身体渐变 -->
    <div class="pet-body-gradient"></div>

    <!-- 耳朵 -->
    <div class="pet-ear ear-left"></div>
    <div class="pet-ear ear-right"></div>

    <!-- 胡须 -->
    <div class="pet-whiskers">
      <div class="whisker whisker-left-1"></div>
      <div class="whisker whisker-left-2"></div>
      <div class="whisker whisker-left-3"></div>
      <div class="whisker whisker-right-1"></div>
      <div class="whisker whisker-right-2"></div>
      <div class="whisker whisker-right-3"></div>
    </div>

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

    <!-- 尾巴 -->
    <div class="pet-tail"></div>

    <!-- 手臂 -->
    <div class="pet-arm arm-left"></div>
    <div class="pet-arm arm-right"></div>

    <!-- 腿 -->
    <div class="pet-leg leg-left"></div>
    <div class="pet-leg leg-right"></div>
  </div>
</template>
