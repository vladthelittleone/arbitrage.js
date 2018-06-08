const config = require("../../config");
const lodash = require("lodash");

class TradingUtils {
  /**
   * Checks the liquidity in the order books of the exchanges and makes sure there are at
   * least {@code orderBookFactor} times the needed liquidity before executing the order.
   *
   * @param ex exchange
   * @param volume volume - amount
   * @param type  asks / bids
   * @param pairName currency pair
   * @return {Promise.<*>}
   */
  static async getLimitPrice (ex, volume, type, pairName) {
    const orderBook = await ex.fetchOrderBook(pairName);
    let totalVolume = 0;
    for (const order of orderBook[type]) {
      // volumes are added up until the requested volume is reached
      totalVolume += order[1];
      if (totalVolume >= volume * TradingUtils.ORDER_BOOK_FACTOR) {
        return order[0];
      }
    }
  }
}

TradingUtils.ORDER_BOOK_FACTOR = config.get("arbitrage:orderBookFactor");
TradingUtils.MAX_EXPOSURE = config.get("arbitrage:maxExposure");
TradingUtils.TARGET_EXPOSURE = config.get("arbitrage:targetExposure");
TradingUtils.LIQUIDITY_DELTA = config.get("arbitrage:liquidityDelta");
TradingUtils.SPREAD_ENTRY = config.get("arbitrage:spreadEntry");
TradingUtils.SPREAD_TARGET = config.get("arbitrage:spreadTarget");
TradingUtils.DEBUG = config.get("arbitrage:debug");
TradingUtils.STATISTICS = config.get("arbitrage:statistics");
TradingUtils.TRAILING_LIMIT = config.get("arbitrage:trailingLimit");
TradingUtils.TRAILING_COUNT = config.get("arbitrage:trailingCount");
TradingUtils.PAIRS = lodash.map(
  config.get("arbitrage:pairs"),
  (e) => {return Object.assign(e, {pairName: `${e.leg1}/${e.leg2}`});}
);

module.exports = TradingUtils;
