import { Monitor } from '@/libs/monitor';
import { Switcher } from '@/libs/switcher';
import { TokenManager } from '@/libs/token-manager';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

(function () {
  from(TokenManager.validateAccessToken())
    .pipe(
      switchMap(() => Monitor.watchUrl$()),
      Monitor.mapChannel(),
      Monitor.swapObservedChannel(),
    )
    .subscribe({
      complete: () => console.error('Observable completed'),
      error: (err) => console.error('Observable error', err),
      next: (from) => Switcher.switch(from),
    });
})();
