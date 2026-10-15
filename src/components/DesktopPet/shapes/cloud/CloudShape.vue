<script setup lang="ts">
/**
 * 云朵形态 - 原造型 + SVG 细节叠加层
 *
 * 设计原则：div 结构与 base.css 的全部状态规则（20+ 状态动画、
 * 30+ 条按 width/height 改写脸部元素的规则）保持原样，一个像素都不动。
 * SVG 只作为「细节叠加层」嵌入既有节点内部：
 * - 眼睛内：虹膜环 + 内透镜渐变 + 月牙高光 + 微光点（随眨眼 scaleY 联动）
 * - 身体上：顶部高光弧 + 云隙柔光
 * 所有叠加层 pointer-events: none 且 inset: 0，不影响布局与点击。
 */
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

    <!-- 身体细节（SVG 细节层：高光弧 + 云隙柔光 + 星光） -->
    <svg
      class="cloud-body-detail"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="cloudGleam" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45" />
          <stop offset="70%" stop-color="#ffffff" stop-opacity="0.15" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="cloudRim" x1="18%" y1="4%" x2="55%" y2="62%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.75" />
          <stop offset="60%" stop-color="#ffffff" stop-opacity="0.28" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- 顶部受光高光弧：沿身体左上圆周的内侧描边 -->
      <path
        class="cloud-rim"
        d="M 18 38
           A 40 40 0 0 1 66 14"
        fill="none"
        stroke="url(#cloudRim)"
        stroke-width="6"
        stroke-linecap="round"
      />

      <!-- 左下云隙柔光 -->
      <ellipse
        class="cloud-gleam cloud-gleam-1"
        cx="28"
        cy="62"
        rx="15"
        ry="7.5"
        fill="url(#cloudGleam)"
        transform="rotate(-10 28 62)"
      />
      <!-- 右侧云隙柔光 -->
      <ellipse
        class="cloud-gleam cloud-gleam-2"
        cx="74"
        cy="56"
        rx="12"
        ry="6"
        fill="url(#cloudGleam)"
        transform="rotate(12 74 56)"
      />
    </svg>

    <!-- 耳朵 -->
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
          <!-- 虹膜细节（SVG 层，随 .eye 的眨眼 scaleY 动画联动） -->
          <svg class="eye-detail" viewBox="0 0 10 10" aria-hidden="true">
            <defs>
              <!-- 内透镜：中心偏亮的纵向光带，制造玻璃球质感 -->
              <radialGradient id="lensL" cx="42%" cy="36%" r="70%">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4" />
                <stop offset="55%" stop-color="#ffffff" stop-opacity="0.1" />
                <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
              </radialGradient>
            </defs>
            <!-- 虹膜环：贴着眼缘的深色描边 -->
            <circle
              cx="5"
              cy="5"
              r="4.35"
              fill="none"
              stroke="#000000"
              stroke-opacity="0.35"
              stroke-width="0.8"
            />
            <!-- 内透镜光带 -->
            <circle cx="5" cy="5" r="4" fill="url(#lensL)" />
            <!-- 月牙高光（左下，与 .eye-shine 的右上圆点高光呼应） -->
            <path
              d="M 2.2 6.6
                 A 3.3 3.3 0 0 0 5.6 8.9
                 A 4.3 4.3 0 0 1 2.2 6.6
                 Z"
              fill="#ffffff"
              opacity="0.5"
            />
            <!-- 底部微光点 -->
            <circle cx="6.6" cy="8" r="0.55" fill="#ffffff" opacity="0.45" />
          </svg>
        </div>
        <div class="eye eye-right">
          <div class="eye-shine"></div>
          <svg class="eye-detail" viewBox="0 0 10 10" aria-hidden="true">
            <defs>
              <radialGradient id="lensR" cx="42%" cy="36%" r="70%">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4" />
                <stop offset="55%" stop-color="#ffffff" stop-opacity="0.1" />
                <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
              </radialGradient>
            </defs>
            <circle
              cx="5"
              cy="5"
              r="4.35"
              fill="none"
              stroke="#000000"
              stroke-opacity="0.35"
              stroke-width="0.8"
            />
            <circle cx="5" cy="5" r="4" fill="url(#lensR)" />
            <path
              d="M 2.2 6.6
                 A 3.3 3.3 0 0 0 5.6 8.9
                 A 4.3 4.3 0 0 1 2.2 6.6
                 Z"
              fill="#ffffff"
              opacity="0.5"
            />
            <circle cx="6.6" cy="8" r="0.55" fill="#ffffff" opacity="0.45" />
          </svg>
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
