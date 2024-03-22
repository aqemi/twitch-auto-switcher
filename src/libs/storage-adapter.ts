import browser from 'webextension-polyfill';

import type { SerializerAsync, StorageLikeAsync, UseStorageAsyncOptions } from '@vueuse/core';

export const syncStorageAdapter: StorageLikeAsync = {
  async getItem(key) {
    const items = await browser.storage.sync.get(key);
    return items[key];
  },

  async setItem(key, value) {
    await browser.storage.sync.set({ [key]: value });
  },

  async removeItem(key) {
    await browser.storage.sync.remove(key);
  },
};

export const asIsSerializer: SerializerAsync<any> = {
  read: async (raw) => raw,
  write: async (value) => value,
};

export const useStorageOptions: UseStorageAsyncOptions<any> = {
  serializer: asIsSerializer,
  onError: console.error, // TODO
};
