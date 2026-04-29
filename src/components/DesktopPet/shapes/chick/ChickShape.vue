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

    <!-- 鸡冠 -->
    <div class="pet-comb">
      <div class="comb-spike comb-1"></div>
      <div class="comb-spike comb-2"></div>
      <div class="comb-spike comb-3"></div>
    </div>

    <!-- 耳朵占位（隐藏，保持结构一致） -->
    <div class="pet-ear ear-left"></div>
    <div class="pet-ear ear-right">
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

      <!-- 嘴巴（尖嘴） -->
      <div class="pet-mouth">
        <div class="mouth-smile"></div>
        <div class="mouth-o"></div>
        <div class="mouth-sad"></div>
        <div class="mouth-angry"></div>
      </div>

      <!-- 尖嘴喙 -->
      <div class="pet-beak">
        <div class="beak-upper"></div>
        <div class="beak-lower"></div>
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

    <!-- 翅膀 -->
    <div class="pet-wing wing-left"></div>
    <div class="pet-wing wing-right">
      <DecoMagicWand v-if="equippedDecorations.includes('magicWand')" />
    </div>

    <!-- 手臂（隐藏，用翅膀替代） -->
    <div class="pet-arm arm-left"></div>
    <div class="pet-arm arm-right"></div>

    <!-- 腿 -->
    <div class="pet-leg leg-left"></div>
    <div class="pet-leg leg-right"></div>

    <!-- 装饰层 -->
    <DecorationsLayer :equipped-decorations="equippedDecorations" />
  </div>
</template>
