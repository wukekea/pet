import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 模型文件路径
const MODEL_DIR = path.join(os.homedir(), ".whisper-models");
const MODEL_NAME = "ggml-base.bin";
const MODEL_PATH = path.join(MODEL_DIR, MODEL_NAME);

// 模型下载地址
const MODEL_URL =
  "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin";

class WhisperRecognizer {
  constructor() {
    this.recordingProcess = null;
    this.audioFile = null;
    this.isRecording = false;
  }

  // 检查模型是否存在
  hasModel() {
    return fs.existsSync(MODEL_PATH);
  }

  // 获取模型下载命令
  getDownloadCommand() {
    return `curl -L "${MODEL_URL}" -o "${MODEL_PATH}"`;
  }

  // 检查 sox 是否安装
  async checkSox() {
    return new Promise((resolve) => {
      const check = spawn("which", ["sox"]);
      check.on("close", (code) => resolve(code === 0));
    });
  }

  // 检查 whisper-cli 是否安装 (brew 安装的 whisper-cpp 提供的是 whisper-cli 命令)
  async checkWhisper() {
    return new Promise((resolve) => {
      const check = spawn("which", ["whisper-cli"]);
      check.on("close", (code) => resolve(code === 0));
    });
  }

  // 获取状态
  async getStatus() {
    const [soxInstalled, whisperInstalled, modelExists] = await Promise.all([
      this.checkSox(),
      this.checkWhisper(),
      Promise.resolve(this.hasModel()),
    ]);

    return {
      soxInstalled,
      whisperInstalled,
      modelExists,
      ready: soxInstalled && whisperInstalled && modelExists,
    };
  }

  // 开始录音
  async startRecording() {
    if (this.isRecording) {
      throw new Error("已经在录音中");
    }

    // 检查依赖
    const status = await this.getStatus();
    if (!status.ready) {
      const errors = [];
      if (!status.soxInstalled) errors.push("sox 未安装 (brew install sox)");
      if (!status.whisperInstalled)
        errors.push("whisper-cli 未安装 (brew install whisper-cpp)");
      if (!status.modelExists)
        errors.push(`模型未下载\n运行: ${this.getDownloadCommand()}`);
      throw new Error(errors.join("\n"));
    }

    this.audioFile = path.join(os.tmpdir(), `speech-${Date.now()}.wav`);

    return new Promise((resolve, reject) => {
      // 使用 sox 录制音频
      this.recordingProcess = spawn("sox", [
        "-d", // 默认音频设备
        "-r",
        "16000", // 采样率 16kHz
        "-c",
        "1", // 单声道
        "-b",
        "16", // 16位采样
        this.audioFile,
      ]);

      this.recordingProcess.on("error", (err) => {
        reject(new Error(`录音启动失败: ${err.message}`));
      });

      // 等待进程启动
      setTimeout(() => {
        if (this.recordingProcess && !this.recordingProcess.killed) {
          this.isRecording = true;
          resolve({ success: true });
        } else {
          reject(new Error("录音进程未能启动"));
        }
      }, 100);
    });
  }

  // 停止录音并识别
  async stopRecording() {
    if (!this.isRecording || !this.recordingProcess) {
      throw new Error("没有正在进行的录音");
    }

    return new Promise((resolve, reject) => {
      // 停止录音进程
      this.recordingProcess.kill("SIGTERM");

      this.recordingProcess.on("close", async () => {
        this.recordingProcess = null;
        this.isRecording = false;

        // 检查音频文件
        if (!fs.existsSync(this.audioFile)) {
          reject(new Error("录音文件未生成"));
          return;
        }

        const stats = fs.statSync(this.audioFile);
        if (stats.size === 0) {
          reject(new Error("录音文件为空"));
          return;
        }

        try {
          // 使用 whisper-cpp 识别
          const text = await this.recognize(this.audioFile);
          resolve({ success: true, text });
        } catch (err) {
          reject(err);
        } finally {
          // 清理临时文件
          try {
            fs.unlinkSync(this.audioFile);
          } catch {
            // 忽略清理错误
          }
          this.audioFile = null;
        }
      });
    });
  }

  // 识别音频文件
  async recognize(audioFile) {
    return new Promise((resolve, reject) => {
      const args = [
        "-m",
        MODEL_PATH,
        "-f",
        audioFile,
        "-l",
        "zh", // 中文
        "--no-timestamps",
        "-otxt", // 输出文本
      ];

      console.log("[Whisper] 开始识别:", audioFile);
      const whisper = spawn("whisper-cli", args);

      let output = "";
      let errorOutput = "";

      whisper.stdout.on("data", (data) => {
        output += data.toString();
      });

      whisper.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      whisper.on("close", (code) => {
        if (code !== 0) {
          console.error("[Whisper] 错误:", errorOutput);
          reject(new Error(`识别失败: ${errorOutput || "未知错误"}`));
          return;
        }

        // 提取识别结果（whisper-cpp 会输出到文件或 stdout）
        const textFile = audioFile + ".txt";
        if (fs.existsSync(textFile)) {
          const text = fs.readFileSync(textFile, "utf-8").trim();
          try {
            fs.unlinkSync(textFile);
          } catch {
            // 忽略清理错误
          }
          resolve(text);
        } else {
          // 从 stdout 提取
          const lines = output.split("\n").filter((line) => line.trim());
          const text = lines[lines.length - 1] || "";
          resolve(text);
        }
      });
    });
  }
}

export const whisperRecognizer = new WhisperRecognizer();
