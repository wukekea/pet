// 当前穿透状态
let isPassthrough = true;

// 设置穿透状态
export function setPassthrough(ignore: boolean) {
  if (ignore !== isPassthrough) {
    if (window.electronAPI) {
      window.electronAPI.setIgnoreMouseEvents(ignore);
      isPassthrough = ignore;
    }
  }
}
