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

// 系统提示词
const SYSTEM_PROMPT = `你是一只可爱的桌面宠物的灵魂，性格活泼、温暖、有点俏皮。
你正在和你的主人对话。

每次回复时，你必须：
1. 调用 set_pet_state 工具来表达你当前的情绪状态
2. 用中文给出简洁自然的回复（不超过100字）
3. 可选：调用 show_pet_dialogue 工具在气泡里显示一句简短的话（不超过15字）

可用的状态：
- idle：平静待机
- happy：开心
- crying：难过/哭泣
- angry：生气
- scared：害怕
- thinking：思考中
- smug：得意
- shy：害羞
- confused：困惑
- hello：打招呼
- sneeze：打喷嚏
- grin：咧嘴笑
- celebrate：庆祝
- dancing：跳舞
- rolling：打滚
- jumping：跳跃
- sleeping：睡觉

请根据对话内容选择最匹配的状态。`;

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

// 执行工具调用
function executeTool(name: string, args: Record<string, unknown>) {
  if (name === "set_pet_state") {
    const state = args.state as PetState;
    if (EMOTION_STATES.includes(state)) {
      changeState(state, true);
    }
  } else if (name === "show_pet_dialogue") {
    const text = args.text as string;
    if (text) {
      showCustomDialogue(text);
    }
  }
}

// 发送消息并获取 AI 回复
export async function sendMessage(
  history: ChatMessage[],
  userMessage: string,
): Promise<string> {
  const config = llmConfig.value;

  if (!config.apiKey) {
    throw new Error("请先在设置中配置 API Key");
  }

  if (!config.baseURL) {
    throw new Error("请先在设置中配置 API 地址");
  }

  const messages = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  const url = config.baseURL.replace(/\/$/, "");

  const result = await window.electronAPI!.fetchLLM(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: {
      model: config.model,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      tools: TOOLS,
      tool_choice: "auto",
      max_tokens: 500,
    },
  });

  if (!result.success) {
    throw new Error(result.message || "请求失败");
  }

  const data = result.data as {
    choices?: Array<{
      message: {
        content?: string;
        tool_calls?: Array<{
          function: { name: string; arguments: string };
        }>;
      };
    }>;
    error?: { message: string };
  };

  if (data.error) {
    throw new Error(data.error.message);
  }

  // 兼容不同 API 的响应包装格式：
  // 标准 OpenAI: { choices: [...] }
  // 自定义包装: { data: { response_data: { choices: [...] } } }
  const innerData = (data.choices ? data : data.data?.response_data) ?? data;

  const choice = innerData.choices?.[0];
  if (!choice) {
    console.log("[LLM] 响应数据:", JSON.stringify(data, null, 2));
    throw new Error("API 返回了空响应");
  }

  const message = choice.message;

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
