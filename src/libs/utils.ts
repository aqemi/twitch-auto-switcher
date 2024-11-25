import browser from 'webextension-polyfill';

const CHANNEL_REGEX = /^\/([a-z0-9_]+)\/?$/i;

export function parseChannelName(value: string) {
  const match = value.match(CHANNEL_REGEX);
  return match && match[1];
}

export function areArraysEqual<T>(a1: T[], a2: T[]): boolean {
  return a1.toString() === a2.toString();
}

export function getRandomElement<T>(list: T[]): T {
  const random = Math.round(Math.random() * list.length);
  return list[random];
}

export function translate(key: string): string {
  return browser.i18n.getMessage(key);
}

export function random(): string {
  return Math.random().toString(36).slice(2);
}
