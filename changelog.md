# Change Log
============

## 0.1.9 Released January 7th, 2021
===================================
- Adds support for $\d+k pattern
- Stops converting values that appear to be using USD as a way to value BTC (ie - $1M BTC)

## 0.1.8 Released January 7th, 2021
===================================
- Recognizes abbreviated USD values (ie - $2T, $3 billion, $6M, etc)
- Adds support for abbreviated values over 1,000,000 BTC

## 0.1.7 Released January 6th, 2021
===================================
- Fixes bug introduced in some scenarios in v0.1.6
- Adds support for abbreviated values over 1000 BTC

## 0.1.6 Released January 6th, 2021
===================================
- Better handling for text elements containing multiple price strings

## 0.1.5 Released January 5th, 2021
===================================
- Adds some redundancy for javascript heavy pages

## 0.1.4 Released January 4th, 2021
===================================
- Fix for NiftyGateway marketplace prices

## 0.1.3 Released January 4th, 2021
===================================
- Started using CoinDesk for prices
- Uses Coinbase as a fallback
- Adds back some whitelisted domain/html elements
- Tweaks regex to catch more uses cases
- Adds support for displaying prices in m sats

## 0.1.2 Released January 4th, 2021
===================================
- Added support for multiple demoniations (BTC, k sats, sats)
- Switched from html tag ID to regex
- Added support for any http connections
