/**
 * 装饰组件统一导出
 *
 * 装饰品分为两类渲染方式：
 *
 * 1. **肢体跟随装饰**（DecoBow、DecoMagicWand）
 *    - 需要嵌入各 Shape 组件的身体部位 DOM 子节点中
 *    - DecoBow 放在 .pet-ear.ear-right 内，跟随耳朵 CSS 动画
 *    - DecoMagicWand 放在 .pet-arm.arm-right 内，跟随手臂 CSS 动画
 *    - 利用 CSS transform 继承机制自动实现动画联动
 *
 * 2. **通用定位装饰**（通过 DecorationsLayer 统一管理）
 *    - 相对于 pet-body 绝对定位，不需要跟随特定肢体动画
 *    - 包括：围巾、花环、礼帽、墨镜、皇冠、勋章
 */
export { default as DecoBow } from "./DecoBow.vue";
export { default as DecoMagicWand } from "./DecoMagicWand.vue";
export { default as DecorationsLayer } from "./DecorationsLayer.vue";
