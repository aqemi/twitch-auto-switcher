import { UserSettings } from './user-settings';
import { NextTargetResolver } from './resolver';

export class Switcher {
  public static async switch(from: string) {
    const isEnabled = await UserSettings.isEnabled();
    if (!isEnabled) {
      console.info('twitch auto switcher is disabled - not redirecting');
      return;
    }
    const nextId = await new NextTargetResolver(from).resolve();
    this.redirect(nextId);
  }

  private static redirect(channel: string) {
    window.location.href = `https://www.twitch.tv/${channel}`;
  }
}
