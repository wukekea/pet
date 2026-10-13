/**
 * 跨组件 UI 层级集中定义
 * 只有跨越组件边界的浮层需要在这里登记（弹窗 > 菜单 > 面板 > 宠物本体）；
 * 组件内部的局部层叠（形态五官、动画元素等小数值 z-index）不在此管理。
 *
 * 层级从低到高：
 *   petBody     1000  宠物本体容器（shapes/base.css）
 *   chatPanel   9998  AI 聊天面板
 *   contextMenu 9999  右键菜单
 *   menuBackdrop 10000 右键菜单展开态
 *   modal       10001  功能弹窗（BaseModal）
 *   confirm     10002  二级确认框（覆盖在弹窗上）
 *   debugPanel  10003  调试面板（仅开发环境，最顶层）
 */
export const Z_INDEX = {
  petBody: 1000,
  chatPanel: 9998,
  contextMenu: 9999,
  menuBackdrop: 10000,
  modal: 10001,
  confirm: 10002,
  debugPanel: 10003,
} as const;
