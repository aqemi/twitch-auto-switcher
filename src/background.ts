import browser from 'webextension-polyfill';
import { TokenManager } from '@/libs/token-manager';

new TokenManager().listen();

// Update the declarative rules on install or upgrade.
browser.runtime.onInstalled.addListener(() => {
  // Page actions are disabled by default and enabled on select tabs
  browser.action.disable();

  // Clear all rules to ensure only our expected rules are set
  browser.declarativeContent.onPageChanged.removeRules(undefined, () => {
    // Declare a rule to enable the action on example.com pages
    const rule = {
      conditions: [
        new browser.declarativeContent.PageStateMatcher({
          pageUrl: {
            hostEquals: 'www.twitch.tv',
          },
        }),
      ],
      actions: [new browser.declarativeContent.ShowAction()],
    };

    // Finally, apply our new array of rules
    const rules = [rule];
    browser.declarativeContent.onPageChanged.addRules(rules);
  });
});
