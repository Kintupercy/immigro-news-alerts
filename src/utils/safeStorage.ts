/**
 * Safe localStorage wrapper that handles iOS Safari Private Browsing
 * and other environments where localStorage is unavailable or throws.
 */

const memoryStorage = new Map<string, string>();

export const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return memoryStorage.get(key) ?? null;
  }
};

export const safeSetItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    memoryStorage.set(key, value);
  }
};

export const safeRemoveItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    memoryStorage.delete(key);
  }
};
