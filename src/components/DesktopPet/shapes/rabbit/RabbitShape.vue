<script setup lang="ts">
import type { PetState, PetDirection } from "../../types";
import { DecoBow, DecoMagicWand, DecorationsLayer } from "../decorations";

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
    <div class="pet-ear ear-left">
      <div class="ear-inner"></div>
    </div>
    <div class="pet-ear ear-right">
      <div class="ear-inner"></div>
      <DecoBow v-if="equippedDecorations.includes('bow')" />
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

      <!-- 鼻子 -->
      <div class="pet-nose"></div>

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
    <div class="pet-arm arm-right">
      <DecoMagicWand v-if="equippedDecorations.includes('magicWand')" />
    </div>

    <!-- 腿 -->
    <div class="pet-leg leg-left"></div>
    <div class="pet-leg leg-right"></div>

    <!-- 装饰层 -->
    <DecorationsLayer :equipped-decorations="equippedDecorations" />
  </div>
</template>
