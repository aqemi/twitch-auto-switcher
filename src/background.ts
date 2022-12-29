// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { TokenManager } from './libs/token-manager';

// Update the declarative rules on install or upgrade.
chrome.runtime.onInstalled.addListener(function () {
  new TokenManager().listen();

  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          // When a page contains a <video> tag...
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostEquals: 'www.twitch.tv',
            },
          }),
        ],
        // ... show the page action.
        actions: [new chrome.declarativeContent.ShowPageAction()],
      },
    ]);
  });
});
