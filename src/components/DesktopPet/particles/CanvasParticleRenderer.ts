import type { ParticleRenderer, RenderFrameInput } from "./types";

/**
 * Canvas 2D 粒子渲染器
 *
 * 预渲染离屏精灵（雨滴渐变、带辉光雪花），每帧仅 drawImage
 * 位图拷贝——无渐变重算、无 DOM 节点。精灵按 (kind, dark)
 * 组合缓存，dpr 变化时重建。
 *
 * 未来接入 WebGL：新写一个实现 ParticleRenderer 的
 * WebGLRenderer（精灵上载为纹理、顶点着色器做位移/淡入淡出），
 * 在粒子逻辑处替换本类即可。
 */

/** 精灵缓存键：kind + 主题 */
interface SpriteKey {
  kind: "rain" | "snow";
  dark: boolean;
}

/** 离屏精灵画布 */
interface Sprite {
  canvas: HTMLCanvasElement;
  /** 绘制锚点（逻辑坐标）：精灵中心（雪花）或顶部中点（雨滴） */
  anchorX: number;
  anchorY: number;
  /** 逻辑尺寸；源画布物理分辨率 = 逻辑 × dpr。
      未定义时源画布即逻辑分辨率（雨滴精灵，1:1 绘制） */
  logical?: number;
}

export class CanvasParticleRenderer implements ParticleRenderer {
  private ctx: CanvasRenderingContext2D;
  private sprites = new Map<string, Sprite>();
  private dpr = 1;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
  }

  render({ particles, dark, width, height }: RenderFrameInput): void {
    const { canvas, ctx } = this;

    // dpr 变化（跨屏拖拽）时重设画布物理尺寸；雪花精灵按 dpr
    // 分辨率构建，一并失效重建
    const dpr = window.devicePixelRatio || 1;
    if (
      canvas.width !== Math.round(width * dpr) ||
      canvas.height !== Math.round(height * dpr) ||
      this.dpr !== dpr
    ) {
      this.dpr = dpr;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      this.sprites.clear();
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    if (particles.length === 0) return;

    // 两类精灵都取：退场期雨滴与雪花同屏共存，逐粒子按类别绘制
    const rainSprite = this.getSprite({ kind: "rain", dark });
    const snowSprite = this.getSprite({ kind: "snow", dark });
    ctx.globalAlpha = 1;

    for (const p of particles) {
      if (p.delay > 0 || p.dead) continue;
      const t = p.age / p.lifespan;
      if (p.width > 0) {
        // ---- 雨滴：窄高竖条（width × size），锚点顶部中点 ----
        // 淡入 10% / 淡出 10%（与原 CSS rain-fall keyframes 一致）
        const alpha =
          t < 0.1 ? t / 0.1 : t > 0.9 ? Math.max(0, (1 - t) / 0.1) * 0.85 : 1;
        if (alpha <= 0) continue;
        ctx.globalAlpha = alpha;
        ctx.drawImage(
          rainSprite.canvas,
          p.x - rainSprite.anchorX,
          p.y - rainSprite.anchorY,
          p.width,
          p.size,
        );
      } else {
        // ---- 雪花：带辉光圆片（size × size），锚点中心 ----
        // 淡入 10% / 中段 0.8-1 / 淡出 10%（复刻原 snowfall keyframes）
        let alpha: number;
        if (t < 0.1) alpha = t / 0.1;
        else if (t > 0.9) alpha = Math.max(0, (1 - t) / 0.1) * 0.8;
        else alpha = t > 0.5 ? 1 - (t - 0.5) * 0.4 : 1; // 0.9 → 0.8
        if (alpha <= 0) continue;
        ctx.globalAlpha = alpha;
        // 源画布是 dpr 倍物理分辨率，目标按粒子尺寸（逻辑 px）缩放
        ctx.drawImage(
          snowSprite.canvas,
          p.x - snowSprite.anchorX,
          p.y - snowSprite.anchorY,
          p.size,
          p.size,
        );
      }
    }
    ctx.globalAlpha = 1;
  }

  dispose(): void {
    this.sprites.clear();
  }

  /** 获取（或构建）精灵缓存 */
  private getSprite(key: SpriteKey): Sprite {
    const cacheKey = `${key.kind}:${key.dark ? 1 : 0}`;
    let sprite = this.sprites.get(cacheKey);
    if (!sprite) {
      sprite =
        key.kind === "rain"
          ? this.buildRainSprite(key)
          : this.buildSnowSprite(key);
      this.sprites.set(cacheKey, sprite);
    }
    return sprite;
  }

  /** 雨滴精灵：竖向 linear-gradient（复刻原 CSS .rain-drop） */
  private buildRainSprite({ dark }: SpriteKey): Sprite {
    // 单位画布：宽 4px 高 64px，绘制时按粒子尺寸拉伸
    const w = 4;
    const h = 64;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    if (dark) {
      grad.addColorStop(0, "rgba(96, 125, 139, 0.35)");
      grad.addColorStop(0.15, "rgba(69, 90, 100, 0.5)");
      grad.addColorStop(0.5, "rgba(55, 71, 79, 0.2)");
      grad.addColorStop(1, "rgba(55, 71, 79, 0)");
    } else {
      grad.addColorStop(0, "rgba(120, 144, 156, 0.3)");
      grad.addColorStop(0.15, "rgba(96, 125, 139, 0.55)");
      grad.addColorStop(0.5, "rgba(69, 90, 100, 0.25)");
      grad.addColorStop(1, "rgba(69, 90, 100, 0)");
    }
    ctx.fillStyle = grad;
    // 底部圆角（原 border-radius: 0 0 2px 2px）；
    // 精灵尺寸即"最大宽度"，窄雨滴（1.5px）缩放绘制时圆角按比例缩小
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, [0, 0, w / 2, w / 2]);
    ctx.fill();

    return { canvas, anchorX: w / 2, anchorY: 0 };
  }

  /** 雪花精灵：带辉光径向渐变（复刻方案二烘焙后的 .snowflake） */
  private buildSnowSprite({ dark }: SpriteKey): Sprite {
    // 精灵尺寸按 dpr 缩放：雪花显示尺寸 5~12 逻辑 px，辉光渐变
    // 从 45% 处开始（核心只占直径 ~45%），精灵 = 最大雪花 12px
    // 的 2.2 倍余量即可覆盖辉光出血——原来固定 64 逻辑 px，实际
    // 显示时被缩到 1/5~1/13，drawImage 的降采样混合成本白付 5 倍。
    // 物理分辨率再乘 dpr，保证 Retina 下不糊（星空精灵同思路）
    const logical = 28;
    const dpr = this.dpr;
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(logical * dpr);
    canvas.height = Math.ceil(logical * dpr);
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr); // 之后按逻辑坐标绘制
    const c = logical / 2;
    const r = logical / 2;

    const grad = ctx.createRadialGradient(c, c, 0, c, c, r);
    if (dark) {
      grad.addColorStop(0, "rgba(227, 242, 253, 0.95)");
      grad.addColorStop(0.3, "rgba(227, 242, 253, 0.8)");
      grad.addColorStop(0.45, "rgba(187, 222, 251, 0.65)");
      grad.addColorStop(0.65, "rgba(187, 222, 251, 0.4)");
      grad.addColorStop(0.8, "rgba(144, 202, 249, 0.2)");
      grad.addColorStop(0.9, "rgba(144, 202, 249, 0.08)");
      grad.addColorStop(1, "rgba(144, 202, 249, 0)");
    } else {
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(0.3, "rgba(255, 255, 255, 0.95)");
      grad.addColorStop(0.45, "rgba(255, 255, 255, 0.8)");
      grad.addColorStop(0.65, "rgba(227, 242, 253, 0.5)");
      grad.addColorStop(0.8, "rgba(255, 255, 255, 0.25)");
      grad.addColorStop(0.9, "rgba(187, 222, 251, 0.12)");
      grad.addColorStop(1, "rgba(187, 222, 251, 0)");
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, logical, logical);

    // 绘制按逻辑尺寸缩放源图（dpr 份在源内），锚点同样按逻辑坐标
    return { canvas, anchorX: c, anchorY: c, logical };
  }
}
