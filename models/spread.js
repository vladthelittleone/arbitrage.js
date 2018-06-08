/**
 * @since 07.01.18
 * @author Skurishin Vladislav
 */
"use strict";

const mongoose = require("../utils/mongoose");
const moment = require("moment");
const Schema = mongoose.Schema;

const schema = new Schema({
  exShortId:  mongoose.Schema.Types.String,
  exLongId:   mongoose.Schema.Types.String,
  spread:     mongoose.Schema.Types.Number,
  longAsk:    mongoose.Schema.Types.Number,
  shortAsk:   mongoose.Schema.Types.Number,
  longBid:    mongoose.Schema.Types.Number,
  shortBid:   mongoose.Schema.Types.Number,
  updateTime: Date,
  minSpread:  mongoose.Schema.Types.Number,
  maxSpread:  mongoose.Schema.Types.Number,
  pairName:   mongoose.Schema.Types.String
});

const Spread = mongoose.model("Spread", schema);

module.exports = Spread;

Spread.create = async ({exShort, exLong, pairName, spread}) => {
  const fromBase = await Spread.findOne({
    exShortId: exShort.id,
    exLongId:  exLong.id
  });
  await Spread.findOneAndUpdate({
      exShortId: exShort.id,
      exLongId:  exLong.id
    }, {
      $set: {
        exShortId:  exShort.id,
        exLongId:   exLong.id,
        spread:     spread,
        maxSpread:  Math.max(spread, fromBase ? fromBase.maxSpread : -Number.MAX_VALUE),
        minSpread:  Math.min(spread, fromBase ? fromBase.minSpread : Number.MAX_VALUE),
        longAsk:    exLong.tickers[pairName].ask,
        shortAsk:   exShort.tickers[pairName].ask,
        longBid:    exLong.tickers[pairName].bid,
        shortBid:   exShort.tickers[pairName].bid,
        pairName:   pairName,
        updateTime: moment()
      }
    },
    {
      upsert: true
    }
  );
};
