import { CommonOptionValue, NextTargetType } from '@/types/next-target.interface';
import type { Stream } from '@/types/streams.response';

import { NoContentError } from './no-content.error';
import { TwitchAPI } from './twitch-api';
import { UserSettings } from './user-settings';

export class NextTargetResolver {
  constructor(private readonly currentChannelId: string) {}

  public async resolve(): Promise<string> {
    try {
      const nextTarget = await UserSettings.getNextTarget();
      if (nextTarget.type === NextTargetType.Category) {
        return await this.getChannelFromCategory(nextTarget.id);
      } else if (nextTarget.type === NextTargetType.Common && nextTarget.value === CommonOptionValue.Current) {
        return await this.getChannelFromCurrentCategory();
      } else if (nextTarget.type === NextTargetType.Common && nextTarget.value === CommonOptionValue.Popular) {
        return await this.getChannelFromPopular();
      } else {
        throw new Error('Unknown next target value');
      }
    } catch (err) {
      if (err instanceof NoContentError) {
        console.info("Couldn't determine next stream - switching to fallback");
        return await this.fallback();
      }
      throw err;
    }
  }

  private async getChannelFromCategory(category: string): Promise<string> {
    const streams = await TwitchAPI.getStreamsByCategory(category);
    return this.getNextId(streams);
  }

  private async getChannelFromCurrentCategory(): Promise<string> {
    const channel = await TwitchAPI.getChannelById(this.currentChannelId);
    if (!channel?.game_id) {
      throw new NoContentError();
    }
    return this.getChannelFromCategory(channel.game_id);
  }

  private async getChannelFromPopular(): Promise<string> {
    const streams = await TwitchAPI.getPopularStreams();
    return this.getNextId(streams);
  }

  private async fallback(): Promise<string> {
    try {
      return await this.getChannelFromCurrentCategory();
    } catch (err) {
      console.info("Couldn't determine next stream in fallback current category - switching to popular");
      if (err instanceof NoContentError) {
        return await this.getChannelFromPopular();
      }
      throw err;
    }
  }

  private getNextId(streams: Stream[]): string {
    const filtered = streams.filter((x) => x.user_id !== this.currentChannelId);
    if (!filtered.length) {
      throw new NoContentError();
    }
    return filtered[0].user_login;
  }
}
