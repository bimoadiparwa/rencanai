import type { Prd, Settings } from "../types";

export interface StorageAdapter {
  getPrds(): Prd[];
  savePrd(prd: Prd): void;
  deletePrd(id: string): void;
  getSettings(): Settings | null;
  saveSettings(settings: Settings): void;
  clearAll(): void;
}

const STORAGE_VERSION = "rencanai-v1";

export class LocalStorageAdapter implements StorageAdapter {
  private key: string;

  constructor(storageKey: string = STORAGE_VERSION) {
    this.key = storageKey;
  }

  private read<T>(defaultValue: T): T {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  }

  private write(value: unknown): void {
    localStorage.setItem(this.key, JSON.stringify(value));
  }

  getPrds(): Prd[] {
    return this.read<Prd[]>([]);
  }

  savePrd(prd: Prd): void {
    const all = this.getPrds();
    const idx = all.findIndex((p) => p.id === prd.id);
    if (idx >= 0) {
      all[idx] = prd;
    } else {
      all.push(prd);
    }
    this.write(all);
  }

  deletePrd(id: string): void {
    const all = this.getPrds().filter((p) => p.id !== id);
    this.write(all);
  }

  getSettings(): Settings | null {
    return this.read<Settings | null>(null);
  }

  saveSettings(settings: Settings): void {
    this.write(settings);
  }

  clearAll(): void {
    localStorage.removeItem(this.key);
  }
}
