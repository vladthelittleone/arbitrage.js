/**
 * Wrapper around the cctx library exchange.
 *
 * @since 03.01.2018
 * @author Skurishin Vladislav
 */
function wrapper (ex) {
  ex.computeShortBalance = computeShortBalance;
  ex.createMarginLimitSellOrder = createMarginLimitSellOrder;
  ex.createMarginLimitBuyOrder = createMarginLimitBuyOrder;
  ex.computeLongBalance = (currency) => ex.balance[currency].free;

  function computeShortBalance (currency) {
    for (const b of ex.balance.info) {
      if (b.type === "trading" && b.currency.toUpperCase() === currency) {
        return b.available;
      }
    }
  }

  function createMarginLimitSellOrder (pair, volume, limPrice) {
    return ex.createLimitSellOrder(
      pair,
      volume,
      limPrice,
      {type: "limit"}
    );
  }

  function createMarginLimitBuyOrder (pair, volume, limPrice) {
    return ex.createLimitBuyOrder(
      pair,
      volume,
      limPrice,
      {type: "limit"}
    );
  }

  return ex;
}

module.exports = wrapper;
