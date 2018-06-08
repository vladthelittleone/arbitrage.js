"use strict";

/**
 * @since 07.01.18
 * @author Skurishin Vladislav
 */
const mongoose = require("../utils/mongoose");

const Schema = mongoose.Schema;
const ENTRY_STATUS = {
  "OPEN":   "open",
  "CLOSED": "closed"
};

const schema = new Schema({
  exShortId:    mongoose.Schema.Types.String,
  exLongId:     mongoose.Schema.Types.String,
  pairName:     mongoose.Schema.Types.String,
  priceLongIn:  mongoose.Schema.Types.Number,
  priceShortIn: mongoose.Schema.Types.Number,
  exitTarget:   mongoose.Schema.Types.Number,
  volumeLong:   mongoose.Schema.Types.Number,
  volumeShort:  mongoose.Schema.Types.Number,
  entryTime:    Date,
  status:       {
    type:    String,
    enum:    [
      ENTRY_STATUS.OPEN,
      ENTRY_STATUS.CLOSED
    ],
    default: ENTRY_STATUS.OPEN
  }
});

const Entry = mongoose.model("Entry", schema);

module.exports = Entry;

Entry.create = async (entryInfo) => {
  const entry = new Entry({
    exShortId:    entryInfo.exShort.id,
    exLongId:     entryInfo.exLong.id,
    priceLongIn:  entryInfo.priceLongIn,
    priceShortIn: entryInfo.priceShortIn,
    exitTarget:   entryInfo.exitTarget,
    entryTime:    entryInfo.entryTime,
    volumeShort:  entryInfo.volumeShort,
    volumeLong:   entryInfo.volumeLong,
    pairName:     entryInfo.pair.pairName
  });
  return await entry.save();
};

Entry.close = async (id) => {
  await Entry.findOneAndUpdate(
    {_id: id},
    {$set: {status: ENTRY_STATUS.CLOSED}}
  );
};

Entry.getOpenEntries = async () => {
  return await Entry.find({status: ENTRY_STATUS.OPEN});
};
