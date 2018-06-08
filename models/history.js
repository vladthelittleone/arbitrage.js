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
  pairName:   mongoose.Schema.Types.String,
  createTime: Date
});

const History = mongoose.model("History", schema);

module.exports = History;

History.create = async ({exShort, exLong, spread, pairName}) => {
  const history = new History({
    exShortId:  exShort.id,
    exLongId:   exLong.id,
    pairName:   pairName,
    spread:     spread,
    createTime: moment()
  });
  return await history.save();
};
