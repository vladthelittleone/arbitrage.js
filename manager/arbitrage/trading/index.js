/**
 * @since 31.12.2017
 * @author Skurishin Vladislav
 */
const Exchanges = require("../exchanges");
const Entry = require("./entry");
const EntryModel = require("../../../models/entry");
const ExitModel = require("../../../models/exit");
const Exit = require("./exit");
const TradingUtils = require("../utils.js");
const TrailingManager = require("./trailing");

const logger = require("../../../utils/telegraf")(module);

const tradingInfo = {};

EntryModel.getOpenEntries().then((opened) => {
  if (opened) {
    opened.forEach((info) => tradingInfo[info.pairName] = withExchanges(info));
  }
});

class Trading {
  static isAlreadyTrading (pairName) {
    return !!tradingInfo[pairName];
  }

  /**
   * Check market on exit. If spread <= exitTarget, then exit market.
   */
  static async tryExit (pairName) {
    const exitInfo = await Exit.check(tradingInfo[pairName]);
    if (exitInfo) {
      const resultInfo = await Exit.start(exitInfo);
      if (resultInfo) {
        await Exchanges.fetchBalances();
        await ExitModel.create(resultInfo);
        delete tradingInfo[pairName];
        return resultInfo;
      } else {
        TrailingManager.reset(pairName);
      }
    }
  }

  /**
   * Check market on entry. If spread > spreadEntry, then enter market.
   */
  static async tryEntry (args) {
    const entryInfo = await Entry.check(args);
    const {pairName} = args.pair;
    if (entryInfo) {
      const exposure = await Trading.computeExposure(args);
      const resultInfo = await Entry.start({entryInfo, exposure});
      if (resultInfo) {
        await Exchanges.fetchBalances();
        tradingInfo[pairName] = withExchanges(await EntryModel.create(resultInfo));
        return resultInfo;
      } else {
        TrailingManager.reset(pairName);
      }
    }
  }

  /**
   * Compute exposure, using config validation data.
   * @param exLong long exchange
   * @param exShort short exchange
   * @param pair currency pair
   * @return {number}
   */
  static async computeExposure ({exShort, exLong, pair}) {
    const shortBalance = exShort.computeShortBalance(pair.leg2);
    const longBalance = exLong.computeLongBalance(pair.leg2);
    let exposure = Math.min(longBalance, shortBalance);
    if (!exposure) {
      logger.warn(`Opportunity found, but no cash available. Trade canceled.`);
      return 0;
    }
    // set target exposure
    if (TradingUtils.TARGET_EXPOSURE) {
      if (exposure >= TradingUtils.TARGET_EXPOSURE) {
        exposure = TradingUtils.TARGET_EXPOSURE;
      } else {
        logger.warn("Opportunity found, but no enough cash. Need more then targetExposure.");
        return 0;
      }
    } else {
      // Removes 1% of the exposure to have
      // a little bit of margin.
      exposure -= 0.01 * exposure;
      if (TradingUtils.MAX_EXPOSURE && exposure >= TradingUtils.MAX_EXPOSURE) {
        logger.warn(
          "Opportunity found, but exposure above the limit. maxExposure will be used instead.");
        exposure = TradingUtils.MAX_EXPOSURE;
      }
    }

    return exposure;
  }
}

function withExchanges (tradingInfo) {
  tradingInfo.exShort = Exchanges.get(tradingInfo.exShortId);
  tradingInfo.exLong = Exchanges.get(tradingInfo.exLongId);
  return tradingInfo;
}

module.exports = Trading;
