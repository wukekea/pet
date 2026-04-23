<script setup lang="ts">
// 程序员效果组件 - 脑力劳动动画
</script>

<template>
  <div class="programmer-effects">
    <!-- 巨大透明显示屏 -->
    <div class="holographic-display">
      <!-- 显示屏外框 - 发光边框 -->
      <div class="display-frame">
        <!-- 显示屏内屏 -->
        <div class="display-screen">
          <!-- 扫描线效果 -->
          <div class="scanlines"></div>

          <!-- 代码滚动区域 -->
          <div class="code-scroll-container">
            <div class="code-scroll">
              <!-- 代码行 1 -->
              <div class="code-line">
                <span class="keyword">const</span>
                <span class="variable">data</span>
                <span class="operator">=</span>
                <span class="function">fetch</span>
                <span class="bracket">(</span>
                <span class="string">'/api'</span>
                <span class="bracket">)</span>
                <span class="punctuation">;</span>
              </div>
              <!-- 代码行 2 -->
              <div class="code-line">
                <span class="keyword">async</span>
                <span class="keyword">function</span>
                <span class="function">process</span>
                <span class="bracket">(</span>
                <span class="variable">items</span>
                <span class="bracket">)</span>
                <span class="bracket">{</span>
              </div>
              <!-- 代码行 3 -->
              <div class="code-line indent">
                <span class="keyword">return</span>
                <span class="variable">items</span>
                <span class="operator">.</span>
                <span class="function">map</span>
                <span class="bracket">(</span>
                <span class="variable">x</span>
                <span class="operator">=></span>
                <span class="variable">x</span>
                <span class="operator">*</span>
                <span class="number">2</span>
                <span class="bracket">)</span>
                <span class="punctuation">;</span>
              </div>
              <!-- 代码行 4 -->
              <div class="code-line">
                <span class="bracket">}</span>
              </div>
              <!-- 代码行 5 -->
              <div class="code-line">
                <span class="keyword">import</span>
                <span class="bracket">{</span>
                <span class="variable">ref</span>
                <span class="punctuation">,</span>
                <span class="variable">computed</span>
                <span class="bracket">}</span>
                <span class="keyword">from</span>
                <span class="string">'vue'</span>
                <span class="punctuation">;</span>
              </div>
              <!-- 代码行 6 -->
              <div class="code-line">
                <span class="keyword">interface</span>
                <span class="type">PetState</span>
                <span class="bracket">{</span>
              </div>
              <!-- 代码行 7 -->
              <div class="code-line indent">
                <span class="property">name</span>
                <span class="punctuation">:</span>
                <span class="type">string</span>
                <span class="punctuation">;</span>
              </div>
              <!-- 代码行 8 -->
              <div class="code-line indent">
                <span class="property">duration</span>
                <span class="punctuation">:</span>
                <span class="type">number</span>
                <span class="punctuation">;</span>
              </div>
              <!-- 代码行 9 -->
              <div class="code-line">
                <span class="bracket">}</span>
              </div>
              <!-- 代码行 10 -->
              <div class="code-line">
                <span class="comment">// Initialize pet controller</span>
              </div>
              <!-- 代码行 11 -->
              <div class="code-line">
                <span class="keyword">export</span>
                <span class="keyword">function</span>
                <span class="function">initPet</span>
                <span class="bracket">(</span>
                <span class="bracket">)</span>
                <span class="bracket">{</span>
              </div>
              <!-- 代码行 12 -->
              <div class="code-line indent">
                <span class="keyword">const</span>
                <span class="variable">pet</span>
                <span class="operator">=</span>
                <span class="function">createPet</span>
                <span class="bracket">(</span>
                <span class="bracket">)</span>
                <span class="punctuation">;</span>
              </div>
              <!-- 代码行 13 -->
              <div class="code-line indent">
                <span class="variable">pet</span>
                <span class="operator">.</span>
                <span class="function">startAnimation</span>
                <span class="bracket">(</span>
                <span class="bracket">)</span>
                <span class="punctuation">;</span>
              </div>
              <!-- 代码行 14 -->
              <div class="code-line">
                <span class="bracket">}</span>
              </div>
              <!-- 代码行 15 -->
              <div class="code-line">
                <span class="keyword">class</span>
                <span class="type">AnimationEngine</span>
                <span class="bracket">{</span>
              </div>
              <!-- 代码行 16 -->
              <div class="code-line indent">
                <span class="keyword">private</span>
                <span class="variable">frames</span>
                <span class="operator">=</span>
                <span class="number">0</span>
                <span class="punctuation">;</span>
              </div>
              <!-- 代码行 17 -->
              <div class="code-line indent">
                <span class="function">render</span>
                <span class="bracket">(</span>
                <span class="bracket">)</span>
                <span class="bracket">{</span>
                <span class="bracket">}</span>
              </div>
              <!-- 代码行 18 -->
              <div class="code-line">
                <span class="bracket">}</span>
              </div>
              <!-- 重复代码行用于无缝滚动 -->
              <div class="code-line">
                <span class="keyword">const</span>
                <span class="variable">data</span>
                <span class="operator">=</span>
                <span class="function">fetch</span>
                <span class="bracket">(</span>
                <span class="string">'/api'</span>
                <span class="bracket">)</span>
                <span class="punctuation">;</span>
              </div>
              <div class="code-line">
                <span class="keyword">async</span>
                <span class="keyword">function</span>
                <span class="function">process</span>
                <span class="bracket">(</span>
                <span class="variable">items</span>
                <span class="bracket">)</span>
                <span class="bracket">{</span>
              </div>
              <div class="code-line indent">
                <span class="keyword">return</span>
                <span class="variable">items</span>
                <span class="operator">.</span>
                <span class="function">map</span>
                <span class="bracket">(</span>
                <span class="variable">x</span>
                <span class="operator">=></span>
                <span class="variable">x</span>
                <span class="operator">*</span>
                <span class="number">2</span>
                <span class="bracket">)</span>
                <span class="punctuation">;</span>
              </div>
              <div class="code-line">
                <span class="bracket">}</span>
              </div>
            </div>
          </div>

          <!-- 光标闪烁 -->
          <div class="cursor-blink">_</div>

          <!-- 屏幕底部反光 -->
          <div class="screen-reflection"></div>
        </div>
      </div>

      <!-- 发光粒子 -->
      <div class="glow-particles">
        <div class="particle particle-1"></div>
        <div class="particle particle-2"></div>
        <div class="particle particle-3"></div>
        <div class="particle particle-4"></div>
      </div>
    </div>

    <!-- 代码雨效果 -->
    <div class="code-rain">
      <div class="code-column column-1">
        <span class="code-char">0</span>
        <span class="code-char">1</span>
        <span class="code-char">0</span>
        <span class="code-char">1</span>
        <span class="code-char">1</span>
        <span class="code-char">0</span>
        <span class="code-char">1</span>
        <span class="code-char">0</span>
      </div>
      <div class="code-column column-2">
        <span class="code-char">&lt;</span>
        <span class="code-char">/</span>
        <span class="code-char">&gt;</span>
        <span class="code-char">{</span>
        <span class="code-char">}</span>
        <span class="code-char">;</span>
        <span class="code-char">=</span>
        <span class="code-char">!</span>
      </div>
      <div class="code-column column-3">
        <span class="code-char">f</span>
        <span class="code-char">u</span>
        <span class="code-char">n</span>
        <span class="code-char">c</span>
        <span class="code-char">t</span>
        <span class="code-char">i</span>
        <span class="code-char">o</span>
        <span class="code-char">n</span>
      </div>
    </div>

    <!-- 咖啡杯 -->
    <div class="coffee-cup">
      <svg viewBox="0 0 32 36" class="coffee-svg">
        <!-- 杯身 -->
        <path
          d="M4 8 L4 24 C4 28 7 32 12 32 L20 32 C25 32 28 28 28 24 L28 8 Z"
          fill="#2C2C2C"
        />
        <path
          d="M6 10 L6 24 C6 27 8 30 12 30 L20 30 C24 30 26 27 26 24 L26 10 Z"
          fill="#1A1A1A"
        />
        <!-- 咖啡液 -->
        <ellipse cx="16" cy="10" rx="9" ry="3" fill="#4A2C2A" />
        <ellipse cx="16" cy="10" rx="7" ry="2" fill="#6B3E3A" />
        <!-- 杯把手 -->
        <path
          d="M28 12 C33 12 34 16 34 18 C34 22 31 24 28 24"
          fill="none"
          stroke="#2C2C2C"
          stroke-width="3"
          stroke-linecap="round"
        />
        <!-- 热气 -->
        <path
          d="M10 4 Q12 1 10 -2"
          stroke="#CCCCCC"
          stroke-width="2"
          fill="none"
          opacity="0.6"
        >
          <animate
            attributeName="d"
            values="M10 4 Q12 1 10 -2;M10 2 Q8 -1 10 -4;M10 4 Q12 1 10 -2"
            dur="2s"
            repeatCount="indefinite"
          />
        </path>
        <path
          d="M16 4 Q18 1 16 -2"
          stroke="#CCCCCC"
          stroke-width="2"
          fill="none"
          opacity="0.6"
        >
          <animate
            attributeName="d"
            values="M16 4 Q18 1 16 -2;M16 2 Q14 -1 16 -4;M16 4 Q18 1 16 -2"
            dur="2s"
            repeatCount="indefinite"
            begin="0.5s"
          />
        </path>
        <path
          d="M22 4 Q24 1 22 -2"
          stroke="#CCCCCC"
          stroke-width="2"
          fill="none"
          opacity="0.6"
        >
          <animate
            attributeName="d"
            values="M22 4 Q24 1 22 -2;M22 2 Q20 -1 22 -4;M22 4 Q24 1 22 -2"
            dur="2s"
            repeatCount="indefinite"
            begin="1s"
          />
        </path>
      </svg>
    </div>

    <!-- 代码窗口 -->
    <div class="code-window">
      <svg viewBox="0 0 60 45" class="window-svg">
        <!-- 窗口背景 -->
        <rect x="2" y="2" width="56" height="41" rx="3" fill="#1E1E1E" />
        <rect x="4" y="4" width="52" height="37" rx="2" fill="#252526" />
        <!-- 标题栏 -->
        <rect x="4" y="4" width="52" height="10" rx="2" fill="#3C3C3C" />
        <circle cx="10" cy="9" r="2" fill="#FF5F57" />
        <circle cx="17" cy="9" r="2" fill="#FEBC2E" />
        <circle cx="24" cy="9" r="2" fill="#28C840" />
        <!-- 代码行 -->
        <rect x="8" y="20" width="12" height="3" rx="1" fill="#C586C0" />
        <rect x="23" y="20" width="20" height="3" rx="1" fill="#9CDCFE" />
        <rect x="8" y="26" width="8" height="3" rx="1" fill="#569CD6" />
        <rect x="19" y="26" width="28" height="3" rx="1" fill="#CE9178" />
        <rect x="8" y="32" width="15" height="3" rx="1" fill="#4EC9B0" />
        <rect x="26" y="32" width="18" height="3" rx="1" fill="#DCDCAA" />
      </svg>
    </div>

    <!-- 黑眼圈 -->
    <div class="dark-circles">
      <div class="dark-circle left">
        <svg viewBox="0 0 16 10" class="circle-svg">
          <ellipse cx="8" cy="5" rx="6" ry="4" fill="#1A1A2E" opacity="0.7" />
          <ellipse cx="8" cy="5" rx="4" ry="2.5" fill="#2D2D44" opacity="0.5" />
        </svg>
      </div>
      <div class="dark-circle right">
        <svg viewBox="0 0 16 10" class="circle-svg">
          <ellipse cx="8" cy="5" rx="6" ry="4" fill="#1A1A2E" opacity="0.7" />
          <ellipse cx="8" cy="5" rx="4" ry="2.5" fill="#2D2D44" opacity="0.5" />
        </svg>
      </div>
    </div>

    <!-- Bug 图标 -->
    <div class="bug-icon bug-1">
      <svg viewBox="0 0 24 24" class="bug-svg">
        <!-- Bug 身体 -->
        <ellipse cx="12" cy="12" rx="6" ry="5" fill="#8B4513" />
        <ellipse cx="12" cy="10" rx="4" ry="3" fill="#A0522D" />
        <!-- 眼睛 -->
        <circle cx="10" cy="9" r="1.5" fill="#333" />
        <circle cx="14" cy="9" r="1.5" fill="#333" />
        <!-- 触角 -->
        <path
          d="M8 6 L6 3"
          stroke="#8B4513"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <path
          d="M16 6 L18 3"
          stroke="#8B4513"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <!-- 腿 -->
        <path
          d="M6 10 L3 8"
          stroke="#8B4513"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <path
          d="M6 14 L3 16"
          stroke="#8B4513"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <path
          d="M18 10 L21 8"
          stroke="#8B4513"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <path
          d="M18 14 L21 16"
          stroke="#8B4513"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
    </div>
    <div class="bug-icon bug-2">
      <svg viewBox="0 0 24 24" class="bug-svg">
        <ellipse cx="12" cy="12" rx="6" ry="5" fill="#8B4513" />
        <ellipse cx="12" cy="10" rx="4" ry="3" fill="#A0522D" />
        <circle cx="10" cy="9" r="1.5" fill="#333" />
        <circle cx="14" cy="9" r="1.5" fill="#333" />
        <path
          d="M8 6 L6 3"
          stroke="#8B4513"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <path
          d="M16 6 L18 3"
          stroke="#8B4513"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <path
          d="M6 10 L3 8"
          stroke="#8B4513"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <path
          d="M6 14 L3 16"
          stroke="#8B4513"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <path
          d="M18 10 L21 8"
          stroke="#8B4513"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <path
          d="M18 14 L21 16"
          stroke="#8B4513"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
    </div>

    <!-- 终端光标 -->
    <div class="terminal-cursor">
      <svg viewBox="0 0 16 20" class="cursor-svg">
        <rect x="2" y="2" width="3" height="16" fill="#00FF00">
          <animate
            attributeName="opacity"
            values="1;0;1"
            dur="1s"
            repeatCount="indefinite"
          />
        </rect>
      </svg>
    </div>

    <!-- 电池电量 -->
    <div class="battery">
      <svg viewBox="0 0 28 14" class="battery-svg">
        <!-- 电池主体 -->
        <rect
          x="2"
          y="2"
          width="22"
          height="10"
          rx="2"
          fill="#333"
          stroke="#555"
          stroke-width="1"
        />
        <!-- 电池头 -->
        <rect x="24" y="5" width="3" height="4" rx="1" fill="#555" />
        <!-- 电量 -->
        <rect x="4" y="4" width="14" height="6" rx="1" fill="#4CAF50">
          <animate
            attributeName="width"
            values="14;8;14"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fill"
            values="#4CAF50;#FFC107;#4CAF50"
            dur="3s"
            repeatCount="indefinite"
          />
        </rect>
        <!-- 充电闪电 -->
        <path
          d="M16 5 L16 9 L18 9 L15 11 L15 7 L13 7 Z"
          fill="#FFF"
          opacity="0.8"
        >
          <animate
            attributeName="opacity"
            values="0.8;0.3;0.8"
            dur="1s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>

    <!-- 头脑风暴图标 -->
    <div class="brainstorm">
      <svg viewBox="0 0 32 32" class="brainstorm-svg">
        <!-- 大脑轮廓 -->
        <path
          d="M16 4 C8 4 4 10 4 16 C4 22 8 28 16 28 C24 28 28 22 28 16 C28 10 24 4 16 4Z"
          fill="none"
          stroke="#9C27B0"
          stroke-width="2"
        />
        <!-- 大脑内部 -->
        <path
          d="M12 12 Q16 8 20 12"
          stroke="#BA68C8"
          stroke-width="2"
          fill="none"
        />
        <path
          d="M10 18 Q16 14 22 18"
          stroke="#BA68C8"
          stroke-width="2"
          fill="none"
        />
        <path
          d="M14 24 Q16 20 18 24"
          stroke="#BA68C8"
          stroke-width="2"
          fill="none"
        />
        <!-- 火花 -->
        <circle cx="16" cy="16" r="2" fill="#FFD700">
          <animate
            attributeName="r"
            values="2;4;2"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>

    <!-- 代码符号 -->
    <div class="code-symbol symbol-1">
      <span class="symbol-text">&lt;/&gt;</span>
    </div>
    <div class="code-symbol symbol-2">
      <span class="symbol-text">{ }</span>
    </div>
    <div class="code-symbol symbol-3">
      <span class="symbol-text">==</span>
    </div>
  </div>
</template>

<style scoped>
.programmer-effects {
  position: absolute;
  inset: -50px;
  pointer-events: none;
  overflow: visible;
}

/* ==================== 全息显示屏 ==================== */
.holographic-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -80%);
  z-index: 5;
}

.display-frame {
  position: relative;
  width: 180px;
  height: 110px;
  border-radius: 12px;
  background: transparent;
  border: 2px solid transparent;
  background-clip: padding-box;
}

/* 发光边框 */
.display-frame::before {
  content: "";
  position: absolute;
  inset: -2px;
  border-radius: 14px;
  padding: 2px;
  background: linear-gradient(
    45deg,
    #00ffc8,
    #0096ff,
    #6400ff,
    #ff00c8,
    #00ffc8
  );
  background-size: 300% 300%;
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: border-gradient 4s linear infinite;
}

.display-frame::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 10px;
  background: transparent;
}

@keyframes frame-glow {
  0%,
  100% {
    box-shadow:
      0 0 20px rgba(0, 255, 200, 0.3),
      0 0 40px rgba(0, 150, 255, 0.2),
      0 0 60px rgba(100, 0, 255, 0.1),
      inset 0 0 30px rgba(0, 255, 200, 0.05);
  }
  50% {
    box-shadow:
      0 0 30px rgba(0, 255, 200, 0.5),
      0 0 60px rgba(0, 150, 255, 0.3),
      0 0 90px rgba(100, 0, 255, 0.2),
      inset 0 0 40px rgba(0, 255, 200, 0.1);
  }
}

@keyframes border-gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 显示屏内屏 */
.display-screen {
  position: absolute;
  inset: 8px;
  border-radius: 6px;
  background: transparent;
  overflow: hidden;
  z-index: 1;
}

/* 扫描线效果 */
.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 2px,
    rgba(0, 255, 200, 0.03) 2px,
    rgba(0, 255, 200, 0.03) 4px
  );
  pointer-events: none;
  z-index: 10;
  animation: scanline-move 8s linear infinite;
}

@keyframes scanline-move {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(20px);
  }
}

/* 代码滚动容器 */
.code-scroll-container {
  position: absolute;
  inset: 6px;
  overflow: hidden;
  mask-image: linear-gradient(
    180deg,
    transparent 0%,
    black 15%,
    black 85%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    180deg,
    transparent 0%,
    black 15%,
    black 85%,
    transparent 100%
  );
}

.code-scroll {
  animation: code-scroll-up 12s linear infinite;
  font-family: "JetBrains Mono", "Fira Code", "SF Mono", Consolas, monospace;
  font-size: 7px;
  line-height: 1.4;
}

@keyframes code-scroll-up {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}

/* 代码行样式 */
.code-line {
  white-space: nowrap;
  padding: 1px 4px;
  letter-spacing: 0.3px;
}

.code-line.indent {
  padding-left: 10px;
}

/* 语法高亮 */
.keyword {
  color: #c792ea;
  font-weight: 500;
}

.variable {
  color: #82aaff;
}

.function {
  color: #82e0aa;
}

.operator {
  color: #89ddff;
  margin: 0 1px;
}

.bracket {
  color: #ffcb6b;
}

.punctuation {
  color: #676e95;
}

.string {
  color: #c3e88d;
}

.number {
  color: #f78c6c;
}

.type {
  color: #ffcb6b;
}

.property {
  color: #f07178;
}

.comment {
  color: #546e7a;
  font-style: italic;
}

/* 光标闪烁 */
.cursor-blink {
  position: absolute;
  bottom: 10px;
  right: 15px;
  font-family: "JetBrains Mono", monospace;
  font-size: 10px;
  color: #00ffc8;
  animation: cursor-blink-anim 1s step-end infinite;
  text-shadow: 0 0 8px #00ffc8;
  z-index: 5;
}

@keyframes cursor-blink-anim {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

/* 屏幕反光 */
.screen-reflection {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.05) 0%,
    transparent 100%
  );
  pointer-events: none;
  border-radius: 6px 6px 0 0;
}

/* 发光粒子 */
.glow-particles {
  position: absolute;
  inset: -20px;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  animation: particle-float 4s ease-in-out infinite;
}

.particle-1 {
  top: 10%;
  left: 5%;
  background: #00ffc8;
  box-shadow: 0 0 10px #00ffc8;
  animation-delay: 0s;
}

.particle-2 {
  top: 20%;
  right: 5%;
  background: #0096ff;
  box-shadow: 0 0 10px #0096ff;
  animation-delay: 1s;
}

.particle-3 {
  bottom: 30%;
  left: 8%;
  background: #6400ff;
  box-shadow: 0 0 10px #6400ff;
  animation-delay: 2s;
}

.particle-4 {
  bottom: 20%;
  right: 8%;
  background: #ff00c8;
  box-shadow: 0 0 10px #ff00c8;
  animation-delay: 3s;
}

@keyframes particle-float {
  0%,
  100% {
    opacity: 0.3;
    transform: translateY(0) scale(1);
  }
  50% {
    opacity: 1;
    transform: translateY(-10px) scale(1.5);
  }
}

/* ==================== 代码雨 ==================== */
.code-rain {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 5;
}

.code-column {
  display: flex;
  flex-direction: column;
  gap: 2px;
  animation: code-fall 3s linear infinite;
}

.column-1 {
  animation-delay: 0s;
}

.column-2 {
  animation-delay: 1s;
}

.column-3 {
  animation-delay: 2s;
}

.code-char {
  font-family: "Courier New", monospace;
  font-size: 8px;
  color: #00ff00;
  opacity: 0;
  animation: char-appear 3s linear infinite;
}

.column-1 .code-char:nth-child(1) {
  animation-delay: 0s;
}
.column-1 .code-char:nth-child(2) {
  animation-delay: 0.3s;
}
.column-1 .code-char:nth-child(3) {
  animation-delay: 0.6s;
}
.column-1 .code-char:nth-child(4) {
  animation-delay: 0.9s;
}
.column-1 .code-char:nth-child(5) {
  animation-delay: 1.2s;
}
.column-1 .code-char:nth-child(6) {
  animation-delay: 1.5s;
}
.column-1 .code-char:nth-child(7) {
  animation-delay: 1.8s;
}
.column-1 .code-char:nth-child(8) {
  animation-delay: 2.1s;
}

.column-2 .code-char:nth-child(1) {
  animation-delay: 0.2s;
}
.column-2 .code-char:nth-child(2) {
  animation-delay: 0.5s;
}
.column-2 .code-char:nth-child(3) {
  animation-delay: 0.8s;
}
.column-2 .code-char:nth-child(4) {
  animation-delay: 1.1s;
}
.column-2 .code-char:nth-child(5) {
  animation-delay: 1.4s;
}
.column-2 .code-char:nth-child(6) {
  animation-delay: 1.7s;
}
.column-2 .code-char:nth-child(7) {
  animation-delay: 2s;
}
.column-2 .code-char:nth-child(8) {
  animation-delay: 2.3s;
}

.column-3 .code-char:nth-child(1) {
  animation-delay: 0.4s;
}
.column-3 .code-char:nth-child(2) {
  animation-delay: 0.7s;
}
.column-3 .code-char:nth-child(3) {
  animation-delay: 1s;
}
.column-3 .code-char:nth-child(4) {
  animation-delay: 1.3s;
}
.column-3 .code-char:nth-child(5) {
  animation-delay: 1.6s;
}
.column-3 .code-char:nth-child(6) {
  animation-delay: 1.9s;
}
.column-3 .code-char:nth-child(7) {
  animation-delay: 2.2s;
}
.column-3 .code-char:nth-child(8) {
  animation-delay: 2.5s;
}

@keyframes char-appear {
  0% {
    opacity: 0;
    transform: translateY(-5px);
  }
  50% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(15px);
  }
}

/* ==================== 咖啡杯 ==================== */
.coffee-cup {
  position: absolute;
  bottom: -35px;
  right: -15px;
  animation: coffee-wobble 2s ease-in-out infinite;
  z-index: 10;
}

.coffee-svg {
  width: 24px;
  height: 27px;
  filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.3));
}

@keyframes coffee-wobble {
  0%,
  100% {
    transform: rotate(-3deg);
  }
  50% {
    transform: rotate(3deg);
  }
}

/* ==================== 代码窗口 ==================== */
.code-window {
  position: absolute;
  top: -30px;
  right: -25px;
  opacity: 0;
  animation: window-float 4s ease-in-out infinite;
  z-index: 10;
}

.window-svg {
  width: 40px;
  height: 30px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
}

@keyframes window-float {
  0%,
  60% {
    opacity: 0;
    transform: translateY(0) scale(0.9);
  }
  65%,
  90% {
    opacity: 1;
    transform: translateY(-10px) scale(1.05);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
}

/* ==================== 黑眼圈 ==================== */
.dark-circles {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 25px;
  z-index: 10;
}

.dark-circle {
  opacity: 0.8;
}

.circle-svg {
  width: 14px;
  height: 9px;
}

/* ==================== Bug 图标 ==================== */
.bug-icon {
  position: absolute;
  opacity: 0;
  animation: bug-crawl 3s ease-in-out infinite;
  z-index: 10;
}

.bug-1 {
  top: -20px;
  left: -20px;
  animation-delay: 0s;
}

.bug-2 {
  top: 5px;
  right: -18px;
  animation-delay: 1.5s;
}

.bug-svg {
  width: 16px;
  height: 16px;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));
}

@keyframes bug-crawl {
  0%,
  70% {
    opacity: 0;
    transform: translate(0, 0) rotate(0deg) scale(0.8);
  }
  75%,
  90% {
    opacity: 1;
    transform: translate(10px, -8px) rotate(180deg) scale(1.1);
  }
  100% {
    opacity: 0;
    transform: translate(20px, -16px) rotate(360deg) scale(0.9);
  }
}

/* ==================== 终端光标 ==================== */
.terminal-cursor {
  position: absolute;
  top: -25px;
  left: -10px;
  z-index: 10;
}

.cursor-svg {
  width: 12px;
  height: 15px;
}

/* ==================== 电池 ==================== */
.battery {
  position: absolute;
  bottom: -30px;
  left: -20px;
  z-index: 10;
}

.battery-svg {
  width: 20px;
  height: 10px;
}

/* ==================== 头脑风暴 ==================== */
.brainstorm {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  animation: brainstorm-pulse 3s ease-in-out infinite;
  z-index: 10;
}

.brainstorm-svg {
  width: 24px;
  height: 24px;
  filter: drop-shadow(0 0 8px rgba(156, 39, 176, 0.6));
}

@keyframes brainstorm-pulse {
  0%,
  70% {
    opacity: 0;
    transform: translateX(-50%) scale(0.8);
  }
  75%,
  90% {
    opacity: 1;
    transform: translateX(-50%) scale(1.1);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) scale(0.9);
  }
}

/* ==================== 代码符号 ==================== */
.code-symbol {
  position: absolute;
  opacity: 0;
  font-family: "Courier New", monospace;
  font-weight: bold;
  animation: symbol-float 2.5s ease-in-out infinite;
  z-index: 10;
}

.symbol-1 {
  top: -15px;
  left: -15px;
  animation-delay: 0s;
}

.symbol-2 {
  top: 0px;
  right: -12px;
  animation-delay: 0.8s;
}

.symbol-3 {
  top: -25px;
  right: -5px;
  animation-delay: 1.6s;
}

.symbol-text {
  font-size: 10px;
  color: #9c27b0;
  filter: drop-shadow(0 0 3px rgba(156, 39, 176, 0.5));
}

@keyframes symbol-float {
  0%,
  60% {
    opacity: 0;
    transform: translateY(0) rotate(-10deg) scale(0.8);
  }
  65%,
  85% {
    opacity: 1;
    transform: translateY(-12px) rotate(10deg) scale(1.1);
  }
  100% {
    opacity: 0;
    transform: translateY(-24px) rotate(20deg) scale(0.9);
  }
}
</style>
