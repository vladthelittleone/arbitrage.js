"use strict";

/**
 * @since 07.01.18
 * @author Skurishin Vladislav
 */
const mongoose = require("../utils/mongoose");
const Entry = require("./entry");
const Schema = mongoose.Schema;

const schema = new Schema({
  entryId:       {
    index:    true,
    type:     Schema.Types.ObjectId,
    ref:      "Entry",
    required: true
  },
  pairName:      mongoose.Schema.Types.String,
  exShortId:     mongoose.Schema.Types.String,
  exLongId:      mongoose.Schema.Types.String,
  priceLongOut:  mongoose.Schema.Types.Number,
  priceShortOut: mongoose.Schema.Types.Number,
  exitTime:      Date
});

const Exit = mongoose.model("Exit", schema);

module.exports = Exit;

Exit.create = async (exitInfo) => {
  await Entry.close(exitInfo._id);
  const exit = new Exit({
    entryId:       exitInfo._id,
    exShortId:     exitInfo.exShort.id,
    exLongId:      exitInfo.exLong.id,
    priceLongOut:  exitInfo.priceLongOut,
    priceShortOut: exitInfo.priceShortOut,
    exitTime:      exitInfo.exitTime,
    pairName:      exitInfo.pairName
  });
  return await exit.save();
};
