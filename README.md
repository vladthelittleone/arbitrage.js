[![version][version-badge]][CHANGELOG]
[![license][license-badge]][LICENSE]
[![Supported Exchanges](https://img.shields.io/badge/exchanges-116-blue.svg)](https://github.com/ccxt/ccxt/wiki/Exchange-Markets)
[![Join the chat at https://gitter.im/vectree-chat/Lobby](https://badges.gitter.im/vectree-chat/Lobby.svg)](https://gitter.im/arbitrage-js/Lobby?utm_source=share-link&utm_medium=link&utm_campaign=share-link)

<p align="center">
<img src="https://user-images.githubusercontent.com/4215285/41159169-4094c0e0-6b34-11e8-9394-69a0b72847ea.png" alt="Blackbird Bitcoin Arbitrage">
</p>

### Introduction

Arbitrage.js is a NodeJS trading system that does automatic long/short arbitrage between Bitcoin and altcoins exchanges. 
This project is a NodeJS copy of C++ [blackbird](https://github.com/butor/blackbird) library with some improvements: 
* arbitrage.js support much more exchanges (see [ccxt](https://github.com/ccxt/ccxt) docs), 
* this project includes telegram bot for notifications, 
* arbitrage.js working with all types of coins supported by [ccxt](https://github.com/ccxt/ccxt).

Thanks [Julien Hamilton](https://github.com/butor/) for [blackbird](https://github.com/butor/blackbird) project!

### How It Works

> Bitcoin and altcoins is still a new and inefficient market. Several exchanges exist around the world and the bid/ask prices they propose can be briefly different from an exchange to another. The purpose of arbitrage.js is to automatically profit from these temporary price differences while being market-neutral.
>  
> Here is a real example where an arbitrage opportunity exists between Bitstamp (long) and Bitfinex (short):
>  
> <p align="center">
> <img src="https://cloud.githubusercontent.com/assets/11370278/11164055/5863e750-8ab3-11e5-86fc-8f7bab6818df.png"  width="60%" alt="Spread Example">
> </p>
>  
> At the first vertical line, the spread between the exchanges is high so Blackbird buys Bitstamp and short sells Bitfinex. Then, when the spread closes (second vertical line), arbitrage.js exits the market by selling Bitstamp and buying Bitfinex back.
> 
> **[Main part of the text was taken from blackbird docs](https://github.com/butor/blackbird#how-it-works)**
 
#### Advantages

> Unlike other arbitrage systems, arbitrage.js doesn't sell but actually _short sells_ Bitcoin or altcoins on the short exchange. This feature offers two important advantages:
>
> 1. The strategy is always market-neutral: the Bitcoin or altcoins market's moves (up or down) don't impact the strategy returns. This removes a huge risk from the strategy. The Bitcoin or altcoins market could suddenly lose half its value that this won't make any difference in the strategy returns.
> 
> 2. The strategy doesn't need to transfer funds (USD or BTC, altcoins) between exchanges. The buy/sell and sell/buy trading activities are done in parallel on two different exchanges, independently. Advantage: no need to deal with transfer latency issues.
>
> More details about _short selling_ and _market neutrality_ can be found on <a href="https://github.com/butor/blackbird/issues/100" target="_blank">issue #100</a>.
> 
> **[Main part of the text was taken from blackbird docs](https://github.com/butor/blackbird#how-it-works)**

### Disclaimer

__USE THE SOFTWARE AT YOUR OWN RISK. YOU ARE RESPONSIBLE FOR YOUR OWN MONEY. PAST PERFORMANCE IS NOT NECESSARILY INDICATIVE OF FUTURE RESULTS.__

__THE AUTHORS AND ALL AFFILIATES ASSUME NO RESPONSIBILITY FOR YOUR TRADING RESULTS.__

### Potential Exchanges

Arbitrage.js using [ccxt](https://github.com/ccxt/ccxt) cryptocurrency trading library for working with exchanges.

[CHANGELOG]: ./CHANGELOG.md
[LICENSE]: ./LICENSE.md
[version-badge]: https://img.shields.io/badge/version-0.0.0-blue.svg
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg
