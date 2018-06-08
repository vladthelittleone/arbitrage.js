/**
 * Wrapper around the cctx library exchange.
 *
 * @since 03.01.2018
 * @author Skurishin Vladislav
 */
function wrapper (ex) {
  ex.computeLongBalance = (currency) => ex.balance[currency].free;
  return ex;
}

module.exports = wrapper;
