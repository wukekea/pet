// localStorage 通用存储工厂

export interface LocalStorageOps<T> {
  /** 保存数据到 localStorage */
  save(data: T): void;
  /** 从 localStorage 加载数据，验证失败返回默认值 */
  load(): T;
  /** 清除 localStorage 中的数据，返回默认值 */
  reset(): T;
}

/**
 * 创建 localStorage 存储操作
 * @param key 存储 key
 * @param defaultValue 默认值
 * @param validate 可选的数据验证函数
 */
export function createLocalStorage<T>(
  key: string,
  defaultValue: T,
  validate?: (data: unknown) => data is T,
): LocalStorageOps<T> {
  return {
    save(data: T): void {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.error(`保存数据失败 (${key}):`, e);
      }
    },
    load(): T {
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          const data = JSON.parse(saved);
          if (!validate || validate(data)) {
            return data;
          }
        }
      } catch (e) {
        console.error(`加载数据失败 (${key}):`, e);
      }
      return structuredClone(defaultValue);
    },
    reset(): T {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error(`重置数据失败 (${key}):`, e);
      }
      return structuredClone(defaultValue);
    },
  };
}
