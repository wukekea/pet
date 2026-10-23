/**
 * 粒子渲染层抽象
 *
 * 上层粒子逻辑（数量、运动、生命周期）只依赖本接口，
 * 与底层渲染实现（当前 Canvas 2D，未来可替换为 WebGL
 * 着色器实现）解耦。替换渲染器时粒子逻辑零改动。
 *
 * 坐标系约定：舞台坐标系，原点左上，280×280（与
 * .weather-background 一致）；本层只做像素换算与绘制，
 * 不感知天气语义。
 */

/** 粒子生命周期状态 */
export interface Particle {
  /** 水平位置（舞台 px） */
  x: number;
  /** 垂直位置（舞台 px，可为负——出生在线外） */
  y: number;
  /** 粒子尺寸（雨滴为长度、雪花为直径，语义由 kind 决定） */
  size: number;
  /** 雨滴宽度（px）；雪花不用此字段 */
  width: number;
  /** 已存活时间（ms） */
  age: number;
  /** 总生命时长（ms），超过即死亡 */
  lifespan: number;
  /** 出生延迟（ms），未到期不绘制不运动（负值 = age 超前的铺底粒子） */
  delay: number;
  /** 是否已死亡（由上层标记，渲染器只读） */
  dead: boolean;
}

/** 粒子类型标识（备用：供 WebGL 实现按类型批量上传顶点） */
export type ParticleKind = "rain" | "snow";

/** 单帧渲染输入：本帧存活的全部粒子。
    粒子类别由数据自带（width > 0 = 雨滴），渲染器不得依赖外部
    状态判断——天气切换的退场期新旧两类粒子会同屏共存 */
export interface RenderFrameInput {
  particles: Particle[];
  /** 舞台 CSS 像素尺寸 */
  width: number;
  height: number;
  /** 暗色主题（切换精灵色调） */
  dark: boolean;
}

/** 粒子渲染器接口 */
export interface ParticleRenderer {
  /**
   * 渲染一帧。实现自行管理画布/上下文与设备像素比。
   * @param dt 距上一帧毫秒数（用于时间步进动画，帧率无关）
   */
  render(input: RenderFrameInput, dt: number): void;
  /** 释放底层资源（WebGL 实现需要；Canvas 实现为空操作） */
  dispose(): void;
}
