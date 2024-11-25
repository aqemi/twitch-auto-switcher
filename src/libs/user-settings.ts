import browser from 'webextension-polyfill';
import { type NextTarget, CommonOptionValue, type NextCategory, NextTargetType } from '@/types/next-target.interface';

type StorageKey = 'enabled' | 'nextTarget' | 'category';

export class UserSettings {
  public static async isEnabled(): Promise<boolean> {
    return (await this.get('enabled')) ?? true;
  }

  public static async setEnabled(value: boolean) {
    await this.set('enabled', value);
  }

  public static async getNextTarget(): Promise<NextTarget> {
    const defaultValue: NextTarget = {
      type: NextTargetType.Common,
      value: CommonOptionValue.Current,
    };

    return (await this.get('nextTarget')) ?? defaultValue;
  }

  public static async setNextTarget(value: NextTarget) {
    await this.set('nextTarget', value);
  }

  public static async getLastSelectedCategory(): Promise<NextCategory | null> {
    return (await this.get('category')) ?? null;
  }

  public static async setLastSelectedCategory(category: NextCategory) {
    await this.set('category', category);
  }

  private static async get<T>(key: StorageKey): Promise<T | undefined> {
    const setting = await browser.storage.sync.get(key);
    return setting[key];
  }

  private static async set(key: StorageKey, value: any): Promise<void> {
    await browser.storage.sync.set({ [key]: value });
  }
}
