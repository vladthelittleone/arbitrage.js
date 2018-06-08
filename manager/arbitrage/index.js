/**
 * @since 30.12.2017
 * @author Skurishin Vladislav
 */
"use strict";

const ENV = process.env.NODE_ENV;

const TrailingManager = require("./trading/trailing");
const TradingUtils = require("./utils.js");
const Trading = require("./trading");
const Exchanges = require("./exchanges");
const logger = require("../../utils/telegraf")(module);
const config = require("../../config");
const lodash = require("lodash");
const moment = require("moment");

const exchanges = Exchanges.get();
const short = lodash.filter(exchanges, ((ex) => ex.isShortSupported));

const ARBITRAGE_JOB = "ARBITRAGE_JOB";
const TIMEOUT = config.get("server:timeoutSeconds") * 1000;

let isRunning = true;

process.on('SIGTERM', stopArbitrage);
process.on('SIGINT', stopArbitrage);

function stopArbitrage () {
  isRunning = false;
}

function isPairSupported ({exShort, exLong, pairName}) {
  return exShort.markets[pairName] && exLong.markets[pairName];
}

async function waitingWrapper (func, message) {
  let result = false;
  while (!result) {
    try {
      await func;
      result = true;
    } catch (e) {
      logger.error(`${message}: ${e.message}`);
      await sleep(5000);
    }
  }
}

const fetchBalances = async () => await waitingWrapper(
  Exchanges.fetchBalances(),
  "Try fetch balances but gets"
);

const fetchTickers = async () => await waitingWrapper(
  await Exchanges.fetchTickers(),
  "Try fetch tickers but gets"
);

async function checkExchanges () {
  await fetchBalances();
  while (isRunning) {
    let timeout = TIMEOUT;
    try {
      const duration = await durationWrapper(arbitrage);
      timeout = TIMEOUT - duration.asMilliseconds();
      if (timeout < 0) {
        logger.warn(`Duration: ${duration.asSeconds()} second(s).`);
      }
    } catch (e) {
      TrailingManager.resetAll();
      logger.error(ENV === "development" ? e : e.message);
    } finally {
      await sleep(timeout);
    }
  }
}

async function arbitrage () {
  await fetchTickers();
  for (const pair of TradingUtils.PAIRS) {
    const {pairName} = pair;
    if (!Trading.isAlreadyTrading(pairName)) {
      for (const exShort of short) {
        for (const exLong of exchanges) {
          if (exLong.id !== exShort.id && isPairSupported({exShort, exLong, pairName})) {
            try {
              await Trading.tryEntry({exShort, exLong, pair});
            } catch (e) {
              TrailingManager.reset(pairName);
              logger.error(`Error while trying entry market with pair [${exShort.id} - ${exLong.id}], cause of ${e.message}`);
            }
          }
        }
      }
    } else {
      await Trading.tryExit(pairName);
    }
  }
}

async function durationWrapper (checked) {
  const start = moment();
  checked && await checked();
  const end = moment();
  return moment.duration(end.diff(start));
}

async function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = checkExchanges();
