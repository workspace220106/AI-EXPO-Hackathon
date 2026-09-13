import { create } from 'zustand';

export type ToastKind = 'coin' | 'badge' | 'rank' | 'info' | 'error';

export interface Toast {
  id: string;
  kind: ToastKind;
  title: string;
  body?: string;
  at: number;
  ttl: number;
  /** Screen position for coin fly-ins (px). */
  x?: number;
  y?: number;
}

interface ToastsState {
  items: Toast[];
  push(t: { kind: ToastKind; title: string; body?: string; ttl?: number; x?: number; y?: number }): string;
  dismiss(id: string): void;
}

let seq = 0;

export const useToasts = create<ToastsState>()((set) => ({
  items: [],
  push(t) {
    const id = `toast_${++seq}`;
    set((s) => ({ items: [...s.items, { id, at: Date.now(), ttl: t.ttl ?? 2600, ...t }] }));
    return id;
  },
  dismiss(id) { set((s) => ({ items: s.items.filter((t) => t.id !== id) })); },
}));
