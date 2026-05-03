import { ipcMain } from "electron";
import { whisperRecognizer } from "./whisperRecognizer.js";

export function setupWhisperIPC() {
  // 检查语音识别状态
  ipcMain.handle("speech:check-status", async () => {
    return await whisperRecognizer.getStatus();
  });

  // 开始录音
  ipcMain.handle("speech:start", async () => {
    try {
      const result = await whisperRecognizer.startRecording();
      return { success: true, ...result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // 停止录音并识别
  ipcMain.handle("speech:stop", async () => {
    try {
      const result = await whisperRecognizer.stopRecording();
      return { success: true, ...result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });
}
