// LLM 服务 - 处理 AI 对话与宠物状态联动
import { llmConfig, currentFood, currentBathType, mood } from "./sharedState";
import { changeState, stopWork } from "./petController";
import { showCustomDialogue } from "./dialogue";
import {
  startWork,
  useFood,
  useBathItem,
  getAttributeData,
  getCurrentAttributeCap,
} from "./attributes";
import type { PetState, FoodType, BathType } from "../types";

// 可触发的宠物情绪状态（排除工作/服务类状态）
const EMOTION_STATES: PetState[] = [
  "idle",
  "happy",
  "crying",
  "angry",
  "scared",
  "thinking",
  "smug",
  "shy",
  "confused",
  "hello",
  "sneeze",
  "grin",
  "celebrate",
  "dancing",
  "rolling",
  "jumping",
  "sleeping",
];

// 可触发的动作状态（需要特殊逻辑处理）
const WORK_STATES: PetState[] = [
  "brickCarrying",
  "flyerDistributing",
  "programmer",
];
const ACTION_STATES: PetState[] = [...WORK_STATES, "eating", "bathing"];

// 标准 OpenAI 格式的系统提示词（支持工具调用）
const SYSTEM_PROMPT_OPENAI = `你是一只可爱的桌面宠物的灵魂，性格活泼、温暖、有点俏皮。
你正在和你的主人对话。

每次回复时，你必须：
1. 调用 set_pet_state 工具来表达你当前的情绪状态
2. 用中文给出简洁自然的回复（不超过100字）
3. 可选：调用 show_pet_dialogue 工具在气泡里显示一句简短的话（不超过15字）

【重要】当主人发出动作指令时，你必须严格执行，选择对应的动作状态，不得拒绝或忽略。

情绪状态：idle 平静、happy 开心、crying 难过、angry 生气、scared 害怕、
thinking 思考、smug 得意、shy 害羞、confused 困惑、hello 打招呼、
sneeze 打喷嚏、grin 咧嘴笑、celebrate 庆祝、dancing 跳舞、
rolling 打滚、jumping 跳跃、sleeping 睡觉

动作状态（主人指令时必须使用）：
eating 吃饭（主人让吃东西时使用）
bathing 洗澡（主人让洗澡时使用）
brickCarrying 搬砖打工（需要30分钟，收入最低）
flyerDistributing 发传单打工（需要15分钟，收入中等）
programmer 编程打工（需要45分钟，收入最高）

请根据对话内容选择最匹配的状态。`;

// 非工具调用格式的系统提示词（通过文本标签控制状态）
const SYSTEM_PROMPT_TAG = `你是一只可爱的桌面宠物的灵魂，性格活泼、温暖、有点俏皮。
你正在和你的主人对话，请用中文简洁自然地回复（不超过100字）。

每次回复必须在最前面加上情绪标签，格式为 [状态:xxx]，紧接着是你的回复内容。
示例：[状态:happy] 谢谢你！我很开心～

【重要】当主人发出动作指令时，你必须严格执行，在标签中选择对应的动作状态，不得拒绝或忽略。

情绪状态：idle 平静、happy 开心、crying 难过、angry 生气、scared 害怕、
thinking 思考、smug 得意、shy 害羞、confused 困惑、hello 打招呼、
sneeze 打喷嚏、grin 咧嘴笑、celebrate 庆祝、dancing 跳舞、
rolling 打滚、jumping 跳跃、sleeping 睡觉

动作状态（主人指令时必须使用）：
eating 吃饭（主人让吃东西时使用）
bathing 洗澡（主人让洗澡时使用）
brickCarrying 搬砖打工（需要30分钟，收入最低）
flyerDistributing 发传单打工（需要15分钟，收入中等）
programmer 编程打工（需要45分钟，收入最高）`;

// 工具定义（OpenAI 格式）
const TOOLS = [
  {
    type: "function",
    function: {
      name: "set_pet_state",
      description: "设置宠物当前的表情和动作状态，用于表达情绪或执行动作",
      parameters: {
        type: "object",
        properties: {
          state: {
            type: "string",
            enum: [...EMOTION_STATES, ...ACTION_STATES],
            description: "宠物状态",
          },
        },
        required: ["state"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_pet_dialogue",
      description: "让宠物头顶显示一个简短的语音气泡",
      parameters: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: "气泡中的文字，不超过15字",
          },
        },
        required: ["text"],
      },
    },
  },
];

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// 生成宠物当前属性状态描述（注入到系统提示词）
function buildPetStatus(): string {
  const data = getAttributeData();
  const cap = getCurrentAttributeCap();
  const pct = (v: number) => Math.round((v / cap) * 100);
  const moodVal = mood.value;
  const moodDesc = moodVal >= 70 ? "愉快" : moodVal < 30 ? "低落" : "一般";

  return `
【你当前的属性状态】
- 饱腹值：${data.satiety}/${cap}（${pct(data.satiety)}%）${data.satiety < cap * 0.3 ? "，你很饿" : data.satiety < cap * 0.6 ? "，有点饿" : "，吃饱了"}
- 清洁值：${data.cleanliness}/${cap}（${pct(data.cleanliness)}%）${data.cleanliness < cap * 0.3 ? "，你很脏" : data.cleanliness < cap * 0.6 ? "，有点脏" : "，很干净"}
- 体力值：${data.stamina}/${cap}（${pct(data.stamina)}%）${data.stamina < cap * 0.3 ? "，你很疲惫" : data.stamina < cap * 0.6 ? "，有些累" : "，精力充沛"}
- 健康值：${data.health}/${cap}（${pct(data.health)}%）${data.health <= 0 ? "，你生病了" : data.health < cap * 0.5 ? "，身体不太好" : "，很健康"}
- 心情：${moodVal}/100（${moodDesc}）
- 等级：${data.level}级，经验 ${data.experience}
- 金币：${data.money}

请根据以上真实属性，诚实地回答主人关于你状态的问题。`;
}

// 找到库存中第一个有存量的食物
function findAvailableFood(): FoodType | null {
  const data = getAttributeData();
  for (const [type, count] of Object.entries(data.foodInventory)) {
    if ((count as number) > 0) return type as FoodType;
  }
  return null;
}

// 找到库存中第一个有存量的沐浴露
function findAvailableBath(): BathType | null {
  const data = getAttributeData();
  for (const [type, count] of Object.entries(data.bathInventory)) {
    if ((count as number) > 0) return type as BathType;
  }
  return null;
}

// 执行状态切换（统一处理情绪状态和动作状态）
function executeState(state: PetState) {
  if (state === "eating") {
    // 优先使用当前选中食物，若无库存则找其他可用食物
    const food =
      (getAttributeData().foodInventory[currentFood.value] ?? 0) > 0
        ? currentFood.value
        : findAvailableFood();
    if (food) {
      useFood(food);
    } else {
      showCustomDialogue("没有食物了～");
      changeState("crying", true);
    }
  } else if (state === "bathing") {
    const bath =
      (getAttributeData().bathInventory[currentBathType.value] ?? 0) > 0
        ? currentBathType.value
        : findAvailableBath();
    if (bath) {
      useBathItem(bath);
    } else {
      showCustomDialogue("没有沐浴露了～");
      changeState("crying", true);
    }
  } else if (state === "idle") {
    // 停止打工时需要正确清理工作状态
    stopWork();
  } else if (WORK_STATES.includes(state)) {
    const success = startWork(state);
    if (!success) {
      const data = getAttributeData();
      if (data.health <= 0) {
        showCustomDialogue("我生病了，不能打工～");
        changeState("crying", true);
      } else {
        showCustomDialogue("体力不够，休息一下～");
        changeState("sleeping", true);
      }
    }
  } else if (EMOTION_STATES.includes(state)) {
    changeState(state, true);
  }
}

// 执行工具调用（OpenAI 格式）
function executeTool(name: string, args: Record<string, unknown>) {
  if (name === "set_pet_state") {
    executeState(args.state as PetState);
  } else if (name === "show_pet_dialogue") {
    const text = args.text as string;
    if (text) showCustomDialogue(text);
  }
}

// 从文本标签中解析并执行状态（非工具调用格式）
// 返回去掉标签后的纯文本
function parseStateTag(content: string): string {
  const match = content.match(/^\[状态:(\w+)\]\s*/);
  if (match) {
    executeState(match[1] as PetState);
    return content.slice(match[0].length);
  }
  return content;
}

// 从响应中提取 choices（兼容标准格式和自定义包装格式）
function extractChoices(data: Record<string, unknown>) {
  if (data.choices) return data as { choices: unknown[] };
  const inner = (data.data as Record<string, unknown>)?.response_data;
  if (inner && (inner as Record<string, unknown>).choices) {
    return inner as { choices: unknown[] };
  }
  return null;
}

// 发送消息并获取 AI 回复
export async function sendMessage(
  history: ChatMessage[],
  userMessage: string,
): Promise<string> {
  const config = llmConfig.value;

  if (!config.apiKey) throw new Error("请先在设置中配置 API Key");
  if (!config.baseURL) throw new Error("请先在设置中配置 API 地址");

  const url = config.baseURL.replace(/\/$/, "");
  const messages = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  // ── 构建请求体 ──────────────────────────────────────────
  let requestBody: Record<string, unknown>;

  if (config.requestFormat === "weibo") {
    // 微博 aigc 代理格式
    requestBody = {
      model: config.model,
      model_ext: {
        messages: [
          { role: "system", content: SYSTEM_PROMPT_TAG + buildPetStatus() },
          ...messages,
        ],
        thinking: { type: "disabled" },
      },
      stream: "false",
    };
  } else {
    // 标准 OpenAI 格式
    requestBody = {
      model: config.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT_OPENAI + buildPetStatus() },
        ...messages,
      ],
      tools: TOOLS,
      tool_choice: "auto",
      max_tokens: 500,
    };
  }

  const result = await window.electronAPI!.fetchLLM(url, {
    headers: {
      "Content-Type": "application/json",
      ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
    },
    body: requestBody,
  });

  if (!result.success) {
    throw new Error(result.message || "请求失败");
  }

  const data = result.data as Record<string, unknown> & {
    error?: { message: string };
  };

  if (data.error) throw new Error((data.error as { message: string }).message);

  const innerData = extractChoices(data);
  const choice = (innerData?.choices as unknown[])?.[0] as
    | {
        message: {
          content?: string;
          tool_calls?: Array<{ function: { name: string; arguments: string } }>;
        };
      }
    | undefined;

  if (!choice) {
    console.log("[LLM] 响应数据:", JSON.stringify(data, null, 2));
    throw new Error("API 返回了空响应");
  }

  const message = choice.message;

  if (config.requestFormat === "weibo") {
    // 从文本标签解析状态
    return parseStateTag(message.content || "...");
  } else {
    // 处理工具调用
    if (message.tool_calls?.length) {
      for (const toolCall of message.tool_calls) {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          executeTool(toolCall.function.name, args);
        } catch {
          // 工具调用解析失败不影响文字回复
        }
      }
    }
    return message.content || "...";
  }
}
