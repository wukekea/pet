/**
 * dialogueLines.mjs 的类型声明。
 *
 * 台词正文的单一事实源在该 .mjs 中（音频生成脚本需在 Node 18 下直接加载），
 * 这里只声明导出形状供 TypeScript 使用，不含任何台词文本。
 */
export const dialogueMessages: Record<string, string[]>;
export const weatherDialogues: Record<string, string[]>;
export const moodDialogues: Record<string, string[]>;
export const dreamTalkMessages: string[];
export const workBusyMessages: string[];
export const eatingBusyMessages: string[];
export const bathingBusyMessages: string[];
export const workScheduleEnterMessages: string[];
export const workScheduleTooTiredMessages: string[];
export const workScheduleExitMessages: string[];
export const wishUponStarMessages: string[];
export const greetingMessages: Record<string, string>;
export const wakeUpGreetingMessages: Record<string, string>;
export const interactionBlockedMessages: {
  readonly noFood: string;
  readonly noBathItem: string;
  readonly tooSickToWork: string;
  readonly tooTiredToWork: string;
};
export const testVoiceMessage: string;
export const TTS_OVERRIDES: Record<string, string>;