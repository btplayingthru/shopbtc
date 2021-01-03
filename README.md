Chrome Extension that shows product prices in BTC
=================================================

How it works
============
When visiting whitelisted hosts, the extension makes a call to Coinbase
to get the latest exchange rate of USD -> BTC.  Then the extension will
look for html tags which are known to contain price data.

It converts the price within those tags to the equivalent price in BTC
and appends the BTC price (denominated in satoshis).


Supported Domains
=================
www.amazon.com


Installation Steps
==================

Adding ShopBTC if you're a developer:
1. Clone this repo on your local machine

2. Open your chrome browser and visit `chrome://extensions`

3. Ensure that the "Developer Mode" is toggled on.

4. Click "Load unpacked" in the upper left.

5. Select the location where you cloned this repo

The extension should appear in your list of extensions.

Navigate to any of the supported domains and you should see
prices listed in sats on any product pages.

Adding ShopBTC through the Chrome Web Store:
