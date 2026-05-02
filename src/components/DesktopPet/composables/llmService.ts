// LLM 服务 - 处理 AI 对话与宠物状态联动
import { llmConfig } from "./sharedState";
import { changeState } from "./petController";
import { showCustomDialogue } from "./dialogue";
import type { PetState } from "../types";

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

// 标准 OpenAI 格式的系统提示词（支持工具调用）
const SYSTEM_PROMPT_OPENAI = `你是一只可爱的桌面宠物的灵魂，性格活泼、温暖、有点俏皮。
你正在和你的主人对话。

每次回复时，你必须：
1. 调用 set_pet_state 工具来表达你当前的情绪状态
2. 用中文给出简洁自然的回复（不超过100字）
3. 可选：调用 show_pet_dialogue 工具在气泡里显示一句简短的话（不超过15字）

可用的状态：idle 平静、happy 开心、crying 难过、angry 生气、scared 害怕、
thinking 思考、smug 得意、shy 害羞、confused 困惑、hello 打招呼、
sneeze 打喷嚏、grin 咧嘴笑、celebrate 庆祝、dancing 跳舞、
rolling 打滚、jumping 跳跃、sleeping 睡觉

请根据对话内容选择最匹配的状态。`;

// 非工具调用格式的系统提示词（通过文本标签控制状态）
const SYSTEM_PROMPT_TAG = `你是一只可爱的桌面宠物的灵魂，性格活泼、温暖、有点俏皮。
你正在和你的主人对话，请用中文简洁自然地回复（不超过100字）。

每次回复必须在最前面加上情绪标签，格式为 [状态:xxx]，紧接着是你的回复内容。
示例：[状态:happy] 谢谢你！我很开心～

可用状态：idle 平静、happy 开心、crying 难过、angry 生气、scared 害怕、
thinking 思考、smug 得意、shy 害羞、confused 困惑、hello 打招呼、
sneeze 打喷嚏、grin 咧嘴笑、celebrate 庆祝、dancing 跳舞、
rolling 打滚、jumping 跳跃、sleeping 睡觉`;

// 工具定义（OpenAI 格式）
const TOOLS = [
  {
    type: "function",
    function: {
      name: "set_pet_state",
      description: "设置宠物当前的表情和动作状态，用于表达情绪",
      parameters: {
        type: "object",
        properties: {
          state: {
            type: "string",
            enum: EMOTION_STATES,
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

// 执行工具调用（OpenAI 格式）
function executeTool(name: string, args: Record<string, unknown>) {
  if (name === "set_pet_state") {
    const state = args.state as PetState;
    if (EMOTION_STATES.includes(state)) {
      changeState(state, true);
    }
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
    const state = match[1] as PetState;
    if (EMOTION_STATES.includes(state)) {
      changeState(state, true);
    }
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
        messages: [{ role: "system", content: SYSTEM_PROMPT_TAG }, ...messages],
        thinking: { type: "disabled" },
      },
      stream: "false",
    };
  } else {
    // 标准 OpenAI 格式
    requestBody = {
      model: config.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT_OPENAI },
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
