<script setup lang="ts">
import type { PetState, PetDirection } from "../../types";

// Props
defineProps<{
  petState: PetState;
  petDirection: PetDirection;
  equippedDecorations: string[];
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

    <!-- 脸部 -->
    <div class="pet-face">
      <!-- 黑色眼圈容器 -->
      <div class="eye-patches">
        <div class="eye-patch eye-patch-left">
          <div class="eye eye-left">
            <div class="eye-shine"></div>
          </div>
        </div>
        <div class="eye-patch eye-patch-right">
          <div class="eye eye-right">
            <div class="eye-shine"></div>
          </div>
        </div>
      </div>

      <!-- 眨眼效果 -->
      <div class="pet-eyes blink">
        <div class="eye eye-left eye-closed"></div>
        <div class="eye eye-right eye-closed"></div>
      </div>

      <!-- 鼻子 -->
      <div class="pet-nose">
        <div class="nose-inner"></div>
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

    <!-- 装饰层 -->
    <div class="pet-decorations">
      <div
        v-if="equippedDecorations.includes('bow')"
        class="deco deco-bow"
      ></div>
      <div
        v-if="equippedDecorations.includes('scarf')"
        class="deco deco-scarf"
      ></div>
      <div
        v-if="equippedDecorations.includes('wreath')"
        class="deco deco-wreath"
      ></div>
      <div
        v-if="equippedDecorations.includes('topHat')"
        class="deco deco-topHat"
      ></div>
      <div
        v-if="equippedDecorations.includes('sunglasses')"
        class="deco deco-sunglasses"
      ></div>
      <div
        v-if="equippedDecorations.includes('crown')"
        class="deco deco-crown"
      ></div>
      <div
        v-if="equippedDecorations.includes('magicWand')"
        class="deco deco-magicWand"
      ></div>
      <div
        v-if="equippedDecorations.includes('medal')"
        class="deco deco-medal"
      ></div>
    </div>
  </div>
</template>
