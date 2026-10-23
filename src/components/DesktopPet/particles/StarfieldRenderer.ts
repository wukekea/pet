/**
 * 星空层 Canvas 渲染器
 *
 * 取代原 SVG 逐星 opacity 动画（SVG 元素动画在 Chromium 上不走
 * 合成器，46 颗星逐帧重绘整个夜晚舞台 SVG，是深夜场景的最大热点）。
 * 复用 particles/ 的渲染层抽象，星空与雨雪同为 Canvas 位图拷贝。
 *
 * 精灵分三种星等形态预渲染（点星/十字亮星/泛蓝大星），
 * 闪烁曲线在 render 内按 age 计算（sin 包络，等价原 CSS
 * star-twinkle keyframes 的 0.15→1→0.15）。
 */

/** 星等形态（与 starrySkyState 的 Star.kind 一致） */
export type StarKind = "dot" | "cross" | "bright";

/** 单颗星的渲染输入（由星空状态模块提供） */
export interface StarRenderItem {
  x: number; // 舞台坐标
  y: number;
  r: number; // 半径
  kind: StarKind;
  /** 闪烁相位 [0,1)：0=最暗，0.5=最亮（一个完整明暗周期） */
  phase: number;
  /** 当前透明度乘数（熄灭淡出期间 0→0，正常期恒 1） */
  alpha: number;
  /** 整层可见性（雨/白天隐藏）由画布显隐控制，不进单星数据 */
}

/** 星空画布渲染器：独立于 ParticleRenderer（星星无运动积分，
    输入是状态快照而非生命周期粒子，但共享同一设计纪律） */
export class StarfieldRenderer {
  private ctx: CanvasRenderingContext2D;
  private dpr = 1;
  private sprites = new Map<string, HTMLCanvasElement>();

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
  }

  render(
    stars: StarRenderItem[],
    width: number,
    height: number,
    brightness: number,
  ): void {
    const { canvas, ctx } = this;

    const dpr = window.devicePixelRatio || 1;
    if (
      canvas.width !== Math.round(width * dpr) ||
      canvas.height !== Math.round(height * dpr) ||
      this.dpr !== dpr
    ) {
      this.dpr = dpr;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      // dpr 变化（跨屏拖拽）后旧精灵分辨率不匹配，全部重建
      this.sprites.clear();
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    if (stars.length === 0 || brightness <= 0) return;

    for (const s of stars) {
      const sprite = this.getSprite(s.kind, s.r);
      // 闪烁：sin 包络 0.15→1→0.15（与原 star-twinkle keyframes 一致）
      const twinkle = 0.15 + 0.85 * Math.sin(s.phase * Math.PI);
      const alpha = twinkle * s.alpha * brightness;
      if (alpha <= 0.01) continue;
      ctx.globalAlpha = alpha;
      // 精灵按 dpr 分辨率构建，此处按逻辑尺寸绘制——物理像素 1:1
      // 映射，无缩放模糊
      const logical = sprite.width / this.dpr;
      ctx.drawImage(
        sprite,
        s.x - logical / 2,
        s.y - logical / 2,
        logical,
        logical,
      );
    }
    ctx.globalAlpha = 1;
  }

  dispose(): void {
    this.sprites.clear();
  }

  /** 获取（或构建）星等精灵；按 (kind, 半径 0.1 精度) 缓存——
      星等实际只有十来档（点星 0.55~1.05 连续、十字 1.1、亮星 1.4），
      缓存命中率极高，且保住每种半径的原生大小 */
  private getSprite(kind: StarKind, r: number): HTMLCanvasElement {
    const key = `${kind}:${r.toFixed(1)}`;
    let sprite = this.sprites.get(key);
    if (!sprite) {
      sprite = this.buildSprite(kind, r);
      this.sprites.set(key, sprite);
    }
    return sprite;
  }

  /** 构建单档星等精灵（按 dpr 分辨率绘制，保证物理像素 1:1 清晰） */
  private buildSprite(kind: StarKind, r: number): HTMLCanvasElement {
    const dpr = this.dpr;
    // 精灵逻辑尺寸：留出十字四芒与辉光的出血（半径 × 5 × 2）
    const logical = Math.ceil(r * 10);
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(logical * dpr);
    canvas.height = Math.ceil(logical * dpr);
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr); // 之后全部按逻辑坐标绘制
    const c = logical / 2;

    if (kind === "cross" || kind === "bright") {
      // 十字四芒：亮星 r*4.5、泛蓝大星同规格（原 SVG path 规格）
      ctx.strokeStyle =
        kind === "bright" ? "rgba(200, 220, 255, 0.55)" : "#e8eef8";
      ctx.lineWidth = kind === "bright" ? 0.8 : 0.5;
      ctx.lineCap = "round";
      const len = r * 4.5;
      ctx.beginPath();
      ctx.moveTo(c - len, c);
      ctx.lineTo(c + len, c);
      ctx.moveTo(c, c - len);
      ctx.lineTo(c, c + len);
      ctx.stroke();
    }

    // 星点本体：点星纯暖白，泛蓝大星偏冷
    ctx.fillStyle = kind === "bright" ? "#dce8ff" : "#f0f3f8";
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  }
}
