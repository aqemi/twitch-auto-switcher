import { Observable, pipe, from, interval, of, fromEvent, merge, EMPTY } from 'rxjs';
import { mapTo, map, distinctUntilChanged, filter, switchMap, catchError, scan, take, tap } from 'rxjs/operators';
import { parseChannelName, areArraysEqual } from './utils';
import { TwitchAPI } from './twitch-api';

const OFFLINE_THRESHOLD = 2;
const POLLING_INTERVAL = 5000;
const NON_CHANNEL = Symbol('Not a channel');

type MappedChannel = string | typeof NON_CHANNEL;

export class Monitor {
  private static observeOnMutation$(target: Node, config: MutationObserverInit): Observable<MutationRecord[]> {
    return new Observable((observer) => {
      const mutation = new MutationObserver((mutations) => {
        observer.next(mutations);
      });
      mutation.observe(target, config);

      const unsubscribe = () => {
        mutation.disconnect();
      };
      return unsubscribe;
    });
  }

  public static watchUrl$(): Observable<string> {
    return this.observeOnMutation$(document.body, { childList: true, subtree: true }).pipe(
      map(() => window.location.pathname),
      distinctUntilChanged(),
    );
  }

  public static manualSwitch$(): Observable<void> {
    return fromEvent<KeyboardEvent>(window, 'keyup').pipe(
      filter((event) => event.ctrlKey && event.key === 'F9'),
      mapTo(undefined),
    );
  }

  public static mapChannel() {
    return pipe(
      map(parseChannelName),
      switchMap((channelName) => (channelName ? this.getChannelId$(channelName) : of(NON_CHANNEL))),
    );
  }

  public static swapObservedChannel() {
    return pipe(
      tap((channelId: MappedChannel) => {
        const log =
          channelId !== NON_CHANNEL ? `Swapping observed channel to ${channelId}` : 'Stopping observing channel';
        console.info(`[Twitch Auto Switcher] ${log}`);
      }),
      switchMap((channel: MappedChannel) => (channel !== NON_CHANNEL ? this.watch$(channel) : EMPTY)),
    );
  }

  private static watch$(channelId: string): Observable<string> {
    return merge(this.watchStreamWithInterval$(channelId), this.manualSwitch$().pipe(mapTo(channelId)));
  }

  private static watchStreamWithInterval$(channelId: string) {
    const capture = OFFLINE_THRESHOLD + 1;
    const offlinePattern = [false, ...Array(OFFLINE_THRESHOLD).fill(true)];

    return interval(POLLING_INTERVAL).pipe(
      switchMap(() => this.isOffline$(channelId)),
      scan<boolean, boolean[]>((acc, value) => [...acc, value].slice(-capture), []),
      map((pollingResult) => areArraysEqual(pollingResult, offlinePattern)),
      filter(Boolean),
      mapTo(channelId),
      take(1),
    );
  }

  private static getChannelId$(channelName: string) {
    return from(TwitchAPI.getChannelId(channelName)).pipe(
      map((channelId) => channelId ?? NON_CHANNEL),
      catchError((err) => {
        console.error('Error on getChannelId', err);
        return of(NON_CHANNEL);
      }),
    );
  }

  private static isOffline$(channelId: string) {
    return from(TwitchAPI.isOffline(channelId)).pipe(
      catchError((err) => {
        console.error('Error on isOffline', err);
        return EMPTY;
      }),
    );
  }
}
