/**
 * 台词数据的类型包装（运行时入口）。
 *
 * 台词正文的单一事实源在 dialogueLines.mjs：scripts/generate-voice-audio.mjs 需要在
 * README 声明的 Node >= 18 下直接读取台词（Node 22.18 之前无法 import .ts），因此
 * 数据放在脚本可直接加载的 .mjs 中。本文件只做类型包装后对外导出，不重复保存任何
 * 台词文本（FR-004）。
 */
import * as lines from "./dialogueLines.mjs";

export const dialogueMessages: Record<string, string[]> =
  lines.dialogueMessages;
export const weatherDialogues: Record<string, string[]> =
  lines.weatherDialogues;
export const moodDialogues: Record<string, string[]> = lines.moodDialogues;
export const dreamTalkMessages: string[] = lines.dreamTalkMessages;
export const workBusyMessages: string[] = lines.workBusyMessages;
export const eatingBusyMessages: string[] = lines.eatingBusyMessages;
export const bathingBusyMessages: string[] = lines.bathingBusyMessages;
export const workScheduleEnterMessages: string[] =
  lines.workScheduleEnterMessages;
export const workScheduleTooTiredMessages: string[] =
  lines.workScheduleTooTiredMessages;
export const workScheduleExitMessages: string[] =
  lines.workScheduleExitMessages;
export const wishUponStarMessages: string[] = lines.wishUponStarMessages;
export const greetingMessages: Record<string, string> = lines.greetingMessages;
export const wakeUpGreetingMessages: Record<string, string> =
  lines.wakeUpGreetingMessages;
export const interactionBlockedMessages: {
  readonly noFood: string;
  readonly noBathItem: string;
  readonly tooSickToWork: string;
  readonly tooTiredToWork: string;
} = lines.interactionBlockedMessages;
export const testVoiceMessage: string = lines.testVoiceMessage;
