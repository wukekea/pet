// Edge TTS IPC 处理
import { ipcMain } from "electron";
import { edgeTTS } from "./edgeTTS.js";

export function setupEdgeTTSIPC() {
  ipcMain.handle("init-edge-tts", async (event) => {
    const sender = event.sender;
    const result = await edgeTTS.init((status, message) => {
      sender.send("edge-tts-progress", status, message);
    });
    return result;
  });

  ipcMain.handle("speak-with-edge-tts", async (_, text) => {
    try {
      await edgeTTS.speak(text);
      return { success: true };
    } catch (error) {
      console.error("Edge TTS 播放失败:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.on("stop-edge-tts", () => {
    edgeTTS.stop();
  });
}
