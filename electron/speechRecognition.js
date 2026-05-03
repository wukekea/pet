import { ipcMain } from "electron";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";

// 使用 sox/rec 录制音频（macOS/Linux）或直接使用系统工具
class SpeechRecognitionService {
  constructor() {
    this.recordingProcess = null;
    this.tmpFile = null;
  }

  // 检查系统是否支持录音
  async checkSupport() {
    return new Promise((resolve) => {
      // 检查是否有录音工具
      const checkSox = spawn("which", ["sox"]);
      checkSox.on("close", (code) => {
        resolve(code === 0);
      });
    });
  }

  // 开始录音
  async startRecording() {
    // 生成临时文件路径
    this.tmpFile = path.join(os.tmpdir(), `recording-${Date.now()}.wav`);

    return new Promise((resolve, reject) => {
      // 使用 sox 录制音频
      // -d: 默认音频设备
      // -r 16000: 采样率 16kHz
      // -c 1: 单声道
      // -b 16: 16位采样
      this.recordingProcess = spawn("sox", [
        "-d",
        "-r",
        "16000",
        "-c",
        "1",
        "-b",
        "16",
        this.tmpFile,
      ]);

      this.recordingProcess.on("error", (err) => {
        reject(new Error(`录音启动失败: ${err.message}`));
      });

      // 等待进程启动
      setTimeout(() => {
        if (this.recordingProcess && !this.recordingProcess.killed) {
          resolve({ success: true, tmpFile: this.tmpFile });
        } else {
          reject(new Error("录音进程未能启动"));
        }
      }, 100);
    });
  }

  // 停止录音并返回音频文件路径
  async stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.recordingProcess) {
        reject(new Error("没有正在进行的录音"));
        return;
      }

      // 停止录音进程
      this.recordingProcess.kill("SIGTERM");

      this.recordingProcess.on("close", () => {
        this.recordingProcess = null;

        // 检查文件是否存在
        if (fs.existsSync(this.tmpFile)) {
          const stats = fs.statSync(this.tmpFile);
          if (stats.size > 0) {
            resolve({ success: true, filePath: this.tmpFile });
          } else {
            reject(new Error("录音文件为空"));
          }
        } else {
          reject(new Error("录音文件未生成"));
        }
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
      this.tmpFile = null;
    }
  }
}

const speechService = new SpeechRecognitionService();

export function setupSpeechRecognitionIPC() {
  // 检查录音支持
  ipcMain.handle("speech:check-support", async () => {
    const supported = await speechService.checkSupport();
    return { supported };
  });

  // 开始录音
  ipcMain.handle("speech:start-recording", async () => {
    try {
      const result = await speechService.startRecording();
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // 停止录音
  ipcMain.handle("speech:stop-recording", async () => {
    try {
      const result = await speechService.stopRecording();
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // 清理录音文件
  ipcMain.handle("speech:cleanup", async () => {
    speechService.cleanup();
    return { success: true };
  });
}
