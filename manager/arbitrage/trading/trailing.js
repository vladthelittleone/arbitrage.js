/**
 * @since 11.01.2018
 * @author Skurishin Vladislav
 */
const TradingUtils = require("../utils.js");
const logger = require("../../../utils/telegraf")(module);

const trailingPairs = {};

class TrailingPair {

  constructor (pairName) {
    this.trailingEntry = {};
    this.trailingExit = {};
    this.pairName = pairName;
  }

  reset () {
    this.trailingEntry = {};
    this.trailingExit = {};
  }

  entry ({shortId, longId, spread}) {
    const trail = spread - TradingUtils.TRAILING_LIMIT;
    const hash = shortId + longId;
    const stored = this.trailingEntry[hash];

    if (spread < TradingUtils.SPREAD_ENTRY) {
      delete this.trailingEntry[hash];
      return false;
    }

    if (!stored) {
      this.trailingEntry[hash] = {
        trail:     Math.max(trail, TradingUtils.SPREAD_ENTRY),
        waitCount: 0
      };
      return false;
    }

    if (trail >= stored.trail) {
      this.trailingEntry[hash] = {
        trail:     trail,
        waitCount: 0
      };
    }

    logger.inout(`Trailing entry for ${this.pairName} is [${shortId} - ${longId}]: ${stored.trail}, ${stored.waitCount} / ${TradingUtils.TRAILING_COUNT}`);

    if (spread >= stored.trail) {
      stored.waitCount = 0;
      return false;
    }

    stored.waitCount++;
    return stored.waitCount >= TradingUtils.TRAILING_COUNT;
  }

  exit ({shortId, longId, spread, exitTarget}) {
    const trail = spread + TradingUtils.TRAILING_LIMIT;
    const hash = shortId + longId;
    const stored = this.trailingExit[hash];

    if (!spread) {
      return false;
    }

    if (spread > exitTarget) {
      delete this.trailingExit[hash];
      return false;
    }

    if (!stored) {
      this.trailingExit[hash] = {
        trail:     Math.min(trail, exitTarget),
        waitCount: 0
      };
      return false;
    }

    if (trail <= stored.trail) {
      this.trailingEntry[hash] = {
        trail:     trail,
        waitCount: 0
      };
    }

    logger.inout(`Trailing exit for ${this.pairName} is [${shortId} - ${longId}]: ${stored.trail}, ${stored.waitCount} / ${TradingUtils.TRAILING_COUNT}`);

    if (spread <= stored.trail) {
      stored.waitCount = 0;
      return false;
    }

    stored.waitCount++;
    return stored.waitCount >= TradingUtils.TRAILING_COUNT;
  }
}

class TrailingManager {
  static reset (pairName) {
    trailingPairs[pairName].reset();
  }

  static resetAll () {
    for (const {pairName} of TradingUtils.PAIRS) {
      trailingPairs[pairName].reset();
    }
  }

  static entry (args) {
    return trailingPairs[args.pairName].entry(args);
  }

  static exit (args) {
    return trailingPairs[args.pairName].exit(args);
  }
}

for (const {pairName} of TradingUtils.PAIRS) {
  trailingPairs[pairName] = new TrailingPair(pairName);
}

module.exports = TrailingManager;

