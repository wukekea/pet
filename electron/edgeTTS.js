import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";

// 跟踪所有创建的临时文件，用于应用退出时清理
const tmpFiles = new Set();

class EdgeTTS {
  constructor() {
    this.isReady = true; // edge-tts 不需要初始化
    this.currentProcess = null;
    this.tmpFile = null;
  }

  // 初始化（edge-tts 不需要，直接返回 true）
  async init(onProgress) {
    onProgress?.("ready", "语音引擎准备就绪");
    return true;
  }

  // 播放文本
  async speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      // 清理之前的临时文件
      this.cleanup();

      // 生成临时文件路径
      this.tmpFile = path.join(os.tmpdir(), `edge-tts-${Date.now()}.mp3`);
      tmpFiles.add(this.tmpFile);

      // 构建 edge-tts 命令
      // 使用中文语音：zh-CN-XiaoxiaoNeural（女声）或 zh-CN-YunxiNeural（男声）
      const voice = options.voice || "zh-CN-XiaoxiaoNeural";
      const rate = options.rate || "+0%"; // 语速
      const volume = options.volume || "+0%"; // 音量

      const args = [
        "--voice",
        voice,
        "--rate",
        rate,
        "--volume",
        volume,
        "--text",
        text,
        "--write-media",
        this.tmpFile,
      ];

      // 停止之前的播放
      this.stop();

      // 启动 edge-tts 进程
      this.currentProcess = spawn("edge-tts", args);

      let errorOutput = "";

      this.currentProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      this.currentProcess.on("error", (err) => {
        console.error("edge-tts 启动错误:", err);
        this.cleanup();
        reject(new Error(`edge-tts 启动失败: ${err.message}`));
      });

      this.currentProcess.on("close", (code) => {
        this.currentProcess = null;

        if (code !== 0) {
          this.cleanup();
          reject(
            new Error(
              `edge-tts 退出码: ${code}, stderr: ${errorOutput || "无"}`,
            ),
          );
          return;
        }

        // 播放生成的音频文件
        this.playAudio(this.tmpFile)
          .then(() => {
            this.cleanup();
            resolve(true);
          })
          .catch((err) => {
            this.cleanup();
            reject(err);
          });
      });
    });
  }

  // 播放音频文件
  async playAudio(filePath) {
    return new Promise((resolve, reject) => {
      const platform = os.platform();
      let command;
      let args;

      if (platform === "darwin") {
        // macOS: 使用 afplay
        command = "afplay";
        args = [filePath];
      } else if (platform === "win32") {
        // Windows: 使用 powershell
        command = "powershell";
        args = [
          "-c",
          `(New-Object Media.SoundPlayer "${filePath}").PlaySync()`,
        ];
      } else {
        // Linux: 使用 mpv 或 ffplay
        command = "mpv";
        args = [filePath, "--no-video"];
      }

      const player = spawn(command, args);

      player.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`播放器退出码: ${code}`));
        } else {
          resolve();
        }
      });

      player.on("error", (err) => {
        reject(err);
      });
    });
  }

  // 清理临时文件
  cleanup() {
    if (this.tmpFile && fs.existsSync(this.tmpFile)) {
      try {
        fs.unlinkSync(this.tmpFile);
      } catch (err) {
        // 忽略清理错误
      }
      tmpFiles.delete(this.tmpFile);
      this.tmpFile = null;
    }
  }

  // 清理所有临时文件（应用退出时调用）
  static cleanupAll() {
    for (const file of tmpFiles) {
      if (fs.existsSync(file)) {
        try {
          fs.unlinkSync(file);
        } catch (err) {
          // 忽略清理错误
        }
      }
    }
    tmpFiles.clear();
  }

  // 停止播放
  stop() {
    if (this.currentProcess) {
      this.currentProcess.kill();
      this.currentProcess = null;
    }
    this.cleanup();
  }
}

// 单例实例
export const edgeTTS = new EdgeTTS();

// 导出类供静态方法使用
export { EdgeTTS };
