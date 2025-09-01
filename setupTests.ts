import '@testing-library/jest-dom';
import { vi } from 'vitest';

// ── localStorage mock global ──
class LocalStorageMock {
  private store = new Map<string, string>();
  getItem(k: string) { return this.store.has(k) ? this.store.get(k)! : null; }
  setItem(k: string, v: string) { this.store.set(k, String(v)); }
  removeItem(k: string) { this.store.delete(k); }
  clear() { this.store.clear(); }
  key(i: number) { return Array.from(this.store.keys())[i] ?? null; }
  get length() { return this.store.size; }
}

global.localStorage = new LocalStorageMock();

// ── Polyfill CustomEvent (por si jsdom falla) ──
(() => {
  try { new CustomEvent('x'); }
  catch {
    // @ts-expect-error
    global.CustomEvent = class CustomEvent<T = any> extends Event {
      detail: T;
      constructor(type: string, params?: { detail?: T }) {
        super(type);
        this.detail = params?.detail as T;
      }
    };
  }
})();

// ── matchMedia dummy (algunas libs lo requieren) ──
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (q: string) => ({
    matches: false, media: q, onchange: null,
    addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// ── (si usas Next App Router en componentes): mock super simple ──
vi.mock('next/navigation', () => {
  const push = vi.fn();
  const replace = vi.fn();
  const prefetch = vi.fn();
  return {
    useRouter: () => ({ push, replace, prefetch }),
    usePathname: () => window.location.pathname,
    useSearchParams: () => new URLSearchParams(window.location.search),
  };
});
