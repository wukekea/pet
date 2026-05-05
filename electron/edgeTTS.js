import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";

// 跟踪所有创建的临时文件，用于应用退出时清理
const tmpFiles = new Set();

class EdgeTTS {
  constructor() {
    this.isReady = false;
    this.currentProcess = null;
    this.tmpFile = null;
    this.shell = false;
    this.audioPlayer = null; // 缓存检测到的播放器

    // Windows 上可能需要使用 shell 模式
    if (os.platform() === "win32") {
      this.shell = true;
    }
  }

  // 检查命令是否可用
  async checkCommand(command, args = ["--version"], useShell = false) {
    return new Promise((resolve) => {
      const check = spawn(command, args, { shell: useShell });
      check.on("close", (code) => resolve(code === 0));
      check.on("error", () => resolve(false));
    });
  }

  // 检测可用的音频播放器
  async detectAudioPlayer() {
    const platform = os.platform();

    if (platform === "darwin") {
      // macOS: 使用 afplay
      console.log("[EdgeTTS] 使用音频播放器: afplay (macOS)");
      return { command: "afplay", args: (file) => [file] };
    }

    if (platform === "win32") {
      // Windows: 按优先级检测播放器
      // 1. 检测 ffplay
      if (await this.checkCommand("ffplay")) {
        console.log("[EdgeTTS] 使用音频播放器: ffplay (ffmpeg)");
        return {
          command: "ffplay",
          args: (file) => ["-nodisp", "-autoexit", "-loglevel", "quiet", file],
        };
      }

      // 2. 检测 PowerShell MediaPlayer
      const psCheck = await this.checkCommand(
        "powershell",
        ["-c", "Add-Type -AssemblyName PresentationCore"],
        true,
      );
      if (psCheck) {
        console.log("[EdgeTTS] 使用音频播放器: PowerShell MediaPlayer");
        return {
          command: "powershell",
          args: (file) => [
            "-c",
            `Add-Type -AssemblyName PresentationCore; $player = New-Object System.Windows.Media.MediaPlayer; $player.Open([System.Uri]::new('${file}')); $player.Play(); Start-Sleep -Seconds 1; while($player.Position -lt $player.NaturalDuration.TimeSpan){ Start-Sleep -Milliseconds 100 }`,
          ],
          useShell: true,
        };
      }

      // 3. 回退到 start 命令
      console.log("[EdgeTTS] 使用音频播放器: cmd start (系统默认播放器)");
      return {
        command: "cmd",
        args: (file) => ["/c", "start", "", file],
        useShell: true,
      };
    }

    // Linux: 检测 mpv 或 ffplay
    if (await this.checkCommand("mpv")) {
      console.log("[EdgeTTS] 使用音频播放器: mpv");
      return { command: "mpv", args: (file) => [file, "--no-video"] };
    }

    if (await this.checkCommand("ffplay")) {
      console.log("[EdgeTTS] 使用音频播放器: ffplay (ffmpeg)");
      return {
        command: "ffplay",
        args: (file) => ["-nodisp", "-autoexit", file],
      };
    }

    console.log("[EdgeTTS] 警告: 未找到可用的音频播放器");
    return null;
  }

  // 检查 edge-tts 是否安装
  async checkInstalled() {
    const platform = os.platform();

    if (platform === "win32") {
      // Windows: 使用 python -m edge_tts --version
      return this.checkCommand("python", ["-m", "edge_tts", "--version"], true);
    }

    // macOS/Linux: 使用 which 命令
    return this.checkCommand("which", ["edge-tts"]);
  }

  // 初始化
  async init(onProgress) {
    onProgress?.("checking", "正在检查语音引擎...");

    const installed = await this.checkInstalled();
    if (!installed) {
      this.isReady = false;
      onProgress?.(
        "not-installed",
        "Edge TTS 未安装，请运行: pip install edge-tts",
      );
      return false;
    }

    // 检测音频播放器
    onProgress?.("checking-player", "正在检测音频播放器...");
    this.audioPlayer = await this.detectAudioPlayer();

    if (!this.audioPlayer) {
      this.isReady = false;
      onProgress?.("no-player", "未找到可用的音频播放器");
      return false;
    }

    this.isReady = true;
    onProgress?.("ready", "语音引擎准备就绪");
    return true;
  }

  // 播放文本
  async speak(text, options = {}) {
    if (!this.isReady || !this.audioPlayer) {
      throw new Error("Edge TTS 未初始化或未就绪");
    }

    return new Promise((resolve, reject) => {
      // 清理之前的临时文件
      this.cleanup();

      // 生成临时文件路径
      this.tmpFile = path.join(os.tmpdir(), `edge-tts-${Date.now()}.mp3`);
      tmpFiles.add(this.tmpFile);

      // 构建 edge-tts 命令
      const voice = options.voice || "zh-CN-XiaoxiaoNeural";
      const rate = options.rate || "+0%";
      const volume = options.volume || "+0%";

      let args = [
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
      let command = "edge-tts";
      if (os.platform() === "win32") {
        command = "python";
        args = ["-m", "edge_tts", ...args];
      }

      this.currentProcess = spawn(command, args, { shell: this.shell });

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
          let errorMessage = `edge-tts 退出码: ${code}`;
          if (errorOutput.includes("NoAudioReceived")) {
            errorMessage =
              "Edge TTS 服务未返回音频，可能原因：网络连接问题、微软服务暂时不可用或文本内容无效";
          } else if (errorOutput.includes("WebSocket")) {
            errorMessage = "无法连接到 Edge TTS 服务，请检查网络连接";
          }
          reject(new Error(errorMessage));
          return;
        }

        // 检查音频文件是否生成成功
        if (
          !fs.existsSync(this.tmpFile) ||
          fs.statSync(this.tmpFile).size === 0
        ) {
          this.cleanup();
          reject(new Error("音频文件生成失败，请检查网络连接和文本内容"));
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
    const { command, args, useShell = false } = this.audioPlayer;

    return new Promise((resolve, reject) => {
      const player = spawn(command, args(filePath), { shell: useShell });

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
