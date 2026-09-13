export interface JsonStorage {
  get<T>(key: string, fallback: T): T;
  set(key: string, value: unknown): void;
  remove(key: string): void;
}

/** JSON storage over a Storage-like backing; any thrown error switches that key to memory. */
export function createStorage(backing: Storage | null): JsonStorage {
  const memory = new Map<string, string>();
  const read = (key: string): string | null => {
    if (memory.has(key)) return memory.get(key)!;
    try { return backing?.getItem(key) ?? null; } catch { return null; }
  };
  const write = (key: string, raw: string) => {
    try { backing?.setItem(key, raw); memory.delete(key); } catch { memory.set(key, raw); }
    if (!backing) memory.set(key, raw);
  };
  return {
    get<T>(key: string, fallback: T): T {
      const raw = read(key);
      if (raw == null) return fallback;
      try { return JSON.parse(raw) as T; } catch { return fallback; }
    },
    set(key, value) { write(key, JSON.stringify(value)); },
    remove(key) {
      memory.delete(key);
      try { backing?.removeItem(key); } catch { /* memory already cleared */ }
    },
  };
}

function safeLocalStorage(): Storage | null {
  try { return typeof window !== 'undefined' ? window.localStorage : null; } catch { return null; }
}

export const storage: JsonStorage = createStorage(safeLocalStorage());
