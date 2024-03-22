import type { GetUsersResponse } from '@/types/users.response';
import type { GetStreamsResponse } from '@/types/streams.response';
import type { Channel, GetChannelInformationResponse } from '@/types/channel.response';
import type { TopCategoriesResponse, Category, SearchCategoriesResponse } from '@/types/categories.response';
import { TokenManager } from './token-manager';

export class TwitchAPI {
  private static async request<T>(path: string, retried = false): Promise<T> {
    const token = await TokenManager.getAccessToken();
    const response = await fetch(`https://api.twitch.tv/helix${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Client-Id': import.meta.env.VITE_APP_CLIENT_ID,
      },
    });

    if (response.status === 401) {
      await TokenManager.deleteTokens();
      if (!retried) {
        return await this.request(path, true);
      }
    }

    if (response.status !== 200) {
      throw new Error('Bad response from server');
    }

    return response.json();
  }

  public static async getChannelId(username: string): Promise<string | null> {
    const response = await this.request<GetUsersResponse>(`/users/?login=${username}`);
    return response.data[0]?.id ?? null;
  }

  public static async isOffline(id: string): Promise<boolean> {
    const response = await this.getStreamsByIds(id);
    return response.data.filter((x) => x.type === 'live').length === 0;
  }

  public static async getChannelById(id: string): Promise<Channel | null> {
    const response = await this.request<GetChannelInformationResponse>(`/channels/?broadcaster_id=${id}`);
    return response.data[0] ?? null;
  }

  public static async getStreamsByIds(ids: string | string[]): Promise<GetStreamsResponse> {
    const idsArray = Array.isArray(ids) ? ids : [ids];
    return this.request<GetStreamsResponse>(`/streams/?user_id=${idsArray.join(',')}`);
  }

  public static async getStreamsByCategory(category: string) {
    const response = await this.request<GetStreamsResponse>(`/streams/?game_id=${category}`);
    return response.data;
  }

  public static async getPopularStreams() {
    const response = await this.request<GetStreamsResponse>('/streams');
    return response.data;
  }

  public static async getTopCategories(): Promise<Category[]> {
    const response = await this.request<TopCategoriesResponse>('/games/top?first=30');
    return response.data;
  }

  public static async searchCategories(query: string): Promise<Category[]> {
    const response = await this.request<SearchCategoriesResponse>(`/search/categories?query=${query}`);
    return response.data;
  }
}
