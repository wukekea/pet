<script setup lang="ts">
// 程序员效果组件 - 脑力劳动动画
// Bug SVG 抽为通用组件，代码雨的 72 行手写 delay 表改用 calc() 生成
import BugSvg from "./icons/BugSvg.vue";

// 代码滚动区的一行代码：语法着色 token 序列
// type 对应 CSS 的 token 类名（keyword/variable/operator/function/
// bracket/string/punctuation/type/property/number/comment）
interface CodeToken {
  text: string;
  type: string;
}

// 显示屏滚动的代码内容（原手写 18 行 × 2 遍，无缝滚动需要内容重复一遍）
const CODE_LINES: { tokens: CodeToken[]; indent?: boolean }[] = [
  {
    tokens: [
      { text: "const", type: "keyword" },
      { text: "data", type: "variable" },
      { text: "=", type: "operator" },
      { text: "fetch", type: "function" },
      { text: "(", type: "bracket" },
      { text: "'/api'", type: "string" },
      { text: ")", type: "bracket" },
      { text: ";", type: "punctuation" },
    ],
  },
  {
    tokens: [
      { text: "async", type: "keyword" },
      { text: "function", type: "keyword" },
      { text: "process", type: "function" },
      { text: "(", type: "bracket" },
      { text: "items", type: "variable" },
      { text: ")", type: "bracket" },
      { text: "{", type: "bracket" },
    ],
  },
  {
    indent: true,
    tokens: [
      { text: "return", type: "keyword" },
      { text: "items", type: "variable" },
      { text: ".", type: "operator" },
      { text: "map", type: "function" },
      { text: "(", type: "bracket" },
      { text: "x", type: "variable" },
      { text: "=>", type: "operator" },
      { text: "x", type: "variable" },
      { text: "*", type: "operator" },
      { text: "2", type: "number" },
      { text: ")", type: "bracket" },
      { text: ";", type: "punctuation" },
    ],
  },
  { tokens: [{ text: "}", type: "bracket" }] },
  {
    tokens: [
      { text: "import", type: "keyword" },
      { text: "{", type: "bracket" },
      { text: "ref", type: "variable" },
      { text: ",", type: "punctuation" },
      { text: "computed", type: "variable" },
      { text: "}", type: "bracket" },
      { text: "from", type: "keyword" },
      { text: "'vue'", type: "string" },
      { text: ";", type: "punctuation" },
    ],
  },
  {
    tokens: [
      { text: "interface", type: "keyword" },
      { text: "PetState", type: "type" },
      { text: "{", type: "bracket" },
    ],
  },
  {
    indent: true,
    tokens: [
      { text: "name", type: "property" },
      { text: ":", type: "punctuation" },
      { text: "string", type: "type" },
      { text: ";", type: "punctuation" },
    ],
  },
  {
    indent: true,
    tokens: [
      { text: "duration", type: "property" },
      { text: ":", type: "punctuation" },
      { text: "number", type: "type" },
      { text: ";", type: "punctuation" },
    ],
  },
  { tokens: [{ text: "}", type: "bracket" }] },
  {
    tokens: [{ text: "// Initialize pet controller", type: "comment" }],
  },
  {
    tokens: [
      { text: "export", type: "keyword" },
      { text: "function", type: "keyword" },
      { text: "initPet", type: "function" },
      { text: "(", type: "bracket" },
      { text: ")", type: "bracket" },
      { text: "{", type: "bracket" },
    ],
  },
  {
    indent: true,
    tokens: [
      { text: "const", type: "keyword" },
      { text: "pet", type: "variable" },
      { text: "=", type: "operator" },
      { text: "createPet", type: "function" },
      { text: "(", type: "bracket" },
      { text: ")", type: "bracket" },
      { text: ";", type: "punctuation" },
    ],
  },
  {
    indent: true,
    tokens: [
      { text: "pet", type: "variable" },
      { text: ".", type: "operator" },
      { text: "startAnimation", type: "function" },
      { text: "(", type: "bracket" },
      { text: ")", type: "bracket" },
      { text: ";", type: "punctuation" },
    ],
  },
  { tokens: [{ text: "}", type: "bracket" }] },
  {
    tokens: [
      { text: "class", type: "keyword" },
      { text: "AnimationEngine", type: "type" },
      { text: "{", type: "bracket" },
    ],
  },
  {
    indent: true,
    tokens: [
      { text: "private", type: "keyword" },
      { text: "frames", type: "variable" },
      { text: "=", type: "operator" },
      { text: "0", type: "number" },
      { text: ";", type: "punctuation" },
    ],
  },
  {
    indent: true,
    tokens: [
      { text: "render", type: "function" },
      { text: "(", type: "bracket" },
      { text: ")", type: "bracket" },
      { text: "{", type: "bracket" },
      { text: "}", type: "bracket" },
    ],
  },
  { tokens: [{ text: "}", type: "bracket" }] },
];

// 无缝滚动：内容渲染两遍
const scrollLines = [...CODE_LINES, ...CODE_LINES];

// 代码雨三列的字符序列
const codeColumns: string[][] = [
  ["0", "1", "0", "1", "1", "0", "1", "0"],
  ["<", "/", ">", "{", "}", ";", "=", "!"],
  ["f", "u", "n", "c", "t", "i", "o", "n"],
];

// 每列的基础 delay（列间 1s 步进）
const columnBaseDelay = (col: number) => `${col}s`;

// 列内每个字符的 delay：列内 0.3s 步进 + 列基础偏移
const charDelay = (col: number, index: number) =>
  `${(col * 0.2 + index * 0.3).toFixed(1)}s`;
</script>

<template>
  <div class="programmer-effects effect-layer">
    <!-- 巨大透明显示屏 -->
    <div class="holographic-display">
      <!-- 显示屏外框 - 发光边框 -->
      <div class="display-frame">
        <!-- 显示屏内屏 -->
        <div class="display-screen">
          <!-- 代码滚动区域 -->
          <div class="code-scroll-container">
            <div class="code-scroll">
              <!-- 代码行由 CODE_LINES 配置生成（内容重复一遍实现无缝滚动） -->
              <div
                v-for="(line, li) in scrollLines"
                :key="li"
                class="code-line"
                :class="{ indent: line.indent }"
              >
                <span
                  v-for="(token, ti) in line.tokens"
                  :key="ti"
                  :class="token.type"
                  >{{ token.text }}</span
                >
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
      <div
        v-for="(column, c) in codeColumns"
        :key="c"
        class="code-column"
        :style="{ '--column-delay': columnBaseDelay(c) }"
      >
        <span
          v-for="(char, i) in column"
          :key="i"
          class="code-char"
          :style="{ '--char-delay': charDelay(c, i) }"
          >{{ char }}</span
        >
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

    <!-- Bug 图标 -->
    <div class="bug-icon bug-1">
      <BugSvg />
    </div>
    <div class="bug-icon bug-2">
      <BugSvg />
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

    <!-- Wi-Fi 信号 -->
    <div class="wifi-signal">
      <svg viewBox="0 0 24 24" class="wifi-svg">
        <!-- 信号波纹 -->
        <path
          d="M12 18 L12 18"
          stroke="#4CAF50"
          stroke-width="3"
          stroke-linecap="round"
        >
          <animate
            attributeName="opacity"
            values="1;0.5;1"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </path>
        <path
          d="M8 14 Q12 10 16 14"
          stroke="#4CAF50"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
        >
          <animate
            attributeName="opacity"
            values="0.5;1;0.5"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </path>
        <path
          d="M4 10 Q12 4 20 10"
          stroke="#4CAF50"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
        >
          <animate
            attributeName="opacity"
            values="0.3;0.8;0.3"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  </div>
</template>

<style scoped>
@import "./shared.css";

.programmer-effects {
  inset: -50px;
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

/* 代码滚动容器 */
.code-scroll-container {
  position: absolute;
  inset: 6px;
  overflow: hidden;
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
  animation-delay: var(--column-delay, 0s);
}

.code-char {
  font-family: "Courier New", monospace;
  font-size: 8px;
  color: #00ff00;
  opacity: 0;
  animation: char-appear 3s linear infinite;
  animation-delay: var(--char-delay, 0s);
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

.bug-icon :deep(.bug-svg) {
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
  top: 8px;
  right: 8px;
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
  bottom: -20px;
  left: -20px;
  animation-delay: 0s;
}

.symbol-2 {
  bottom: -10px;
  left: -25px;
  animation-delay: 0.8s;
}

.symbol-3 {
  bottom: -25px;
  left: -15px;
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

/* ==================== Wi-Fi 信号 ==================== */
.wifi-signal {
  position: absolute;
  bottom: -25px;
  left: -20px;
  z-index: 10;
}

.wifi-svg {
  width: 18px;
  height: 18px;
  filter: drop-shadow(0 0 4px rgba(76, 175, 80, 0.6));
}
</style>
