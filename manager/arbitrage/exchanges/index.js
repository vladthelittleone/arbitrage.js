/**
 * @since 03.01.2018
 * @author Skurishin Vladislav
 */
const ccxt = require("ccxt");
const config = require("../../../config");
const defaultWrapper = require("./default");
const TradingUtils = require("../utils.js");
const lodash = require("lodash");

const exchanges = [];
const map = {};
initialize();

class Exchanges {
  /**
   * Fetch balance info.
   * @return {Promise.<void>}
   */
  static async fetchBalances () {
    for (const ex of exchanges) {
      if (!TradingUtils.STATISTICS) {
        ex.balance = await ex.fetchBalance();
      } else {
        await ex.loadMarkets();
      }
    }
  }

  /**
   * Fetch last tickers info in parallel.
   * @return {Promise.<void>}
   */
  static async fetchTickers () {
    let funcs = [];
    const symbols = lodash.map(TradingUtils.PAIRS, (p) => p.pairName);
    for (const ex of exchanges) {
      if (ex.hasFetchTickers) {
        fetchByOne(ex);
      } else {
        // If exchange doesn't support fetchTickers,
        // then fetch tickers separately.
        fetchBySeparate(ex, symbols);
      }
    }
    await Promise.all(funcs);

    /**
     * Push promise for fetchTickers request.
     * @return {Array}
     */
    function fetchByOne (ex) {
      funcs.push(new Promise((resolve, reject) => {
        ex.fetchTickers().then((res) => {
          ex.tickers = res;
          resolve();
        }).catch(reject);
      }));
    }

    /**
     * Push promise for separate fetchTicker requests.
     * @return {Array}
     */
    function fetchBySeparate (ex, symbols) {
      lodash.forEach(symbols, (symbol) => {
        // is currency supported by exchange
        if (ex.markets[symbol]) {
          funcs.push(new Promise((resolve, reject) => {
            // is fetchTicker supported
            if (ex.hasFetchTicker) {
              ex.fetchTicker(symbol).then((res) => {
                ex.tickers[symbol] = res;
                resolve();
              }).catch(reject);
            }
          }));
        }
      });
    }
  }

  static get (id) {
    return id ? map[id] : exchanges;
  }
}

// Private

function initialize () {
  const exConfigs = config.get("arbitrage:exchanges");
  for (const name in exConfigs) {
    if (exConfigs.hasOwnProperty(name)) {
      const conf = exConfigs[name];
      const ex = create(name, exConfigs[name]);
      ex.isShortSupported = conf.isShortSupported;
      map[ex.id] = ex;
      exchanges.push(ex);
    }
  }
}

function create (name, conf) {
  const ex = new ccxt[name](conf);
  try {
    const wrapper = require(`./${name}`);
    wrapper.tickers = {};
    return wrapper(ex);
  } catch (e) {
    return defaultWrapper(ex);
  }
}

module.exports = Exchanges;
