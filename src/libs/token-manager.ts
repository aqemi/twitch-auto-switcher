import { RuntimeMessage } from '../types/runtime-message.enum';

enum TokenType {
  AppAccessToken = 'AppAccessToken',
  UserAccessToken = 'UserAccessToken',
}

export class TokenManager {
  public static async validateAccessToken(): Promise<void> {
    const token = await this.getAccessToken();
    const response = await fetch('https://id.twitch.tv/oauth2/validate', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      await this.deleteTokens();
    }
  }

  public static getAccessToken(): Promise<string> {
    return this.getAppAccessToken();
  }

  private static async getAppAccessToken(): Promise<string> {
    let token = await this.getStoredToken(TokenType.AppAccessToken);
    if (!token) {
      token = await this.fetchAppAccessToken();
      await this.storeToken(TokenType.AppAccessToken, token);
    }
    return token;
  }

  private static async getStoredToken(type: TokenType): Promise<string | null> {
    const response = await browser.storage.local.get(type);
    return response[type];
  }

  private static async storeToken(type: TokenType, token: string): Promise<void> {
    await browser.storage.local.set({ [type]: token });
  }

  public static async deleteTokens() {
    await browser.storage.local.remove(Object.values(TokenType));
  }

  private static async fetchAppAccessToken(): Promise<string> {
    return browser.runtime.sendMessage(RuntimeMessage.FetchAuthToken);
  }

  public listen(): void {
    browser.runtime.onMessage.addListener((message: RuntimeMessage) => {
      if (message === RuntimeMessage.FetchAuthToken) {
        return this.fetchAppAccessTokenWithinOrigin();
      }
      return false;
    });
  }

  private async fetchAppAccessTokenWithinOrigin(): Promise<string> {
    const response = await fetch(process.env.VUE_APP_AUTH_ENDPOINT, {
      headers: {
        'X-APi-Key': self.crypto.randomUUID(),
      },
    });
    if (!response.ok) {
      throw new Error('Auth token fetch error');
    }
    const { accessToken } = await response.json();
    return accessToken;
  }
}
