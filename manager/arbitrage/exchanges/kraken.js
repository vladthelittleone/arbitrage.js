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
    return ex.balance.total[currency.toUpperCase()];
  }

  function createMarginLimitSellOrder (pair, volume, limPrice) {
    return ex.createLimitSellOrder(
      pair,
      volume,
      limPrice,
      {
        leverage:          "0",
        trading_agreement: "agree"
      }
    );
  }

  function createMarginLimitBuyOrder (pair, volume, limPrice) {
    return ex.createLimitBuyOrder(
      pair,
      volume,
      limPrice,
      {
        leverage:          "0",
        trading_agreement: "agree"
      }
    );
  }

  return ex;
}

module.exports = wrapper;
