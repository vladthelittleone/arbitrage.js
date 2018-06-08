/**
 * @since 03.02.16
 * @author Skurishin Vladislav
 */
const mongoose = require("mongoose");
const config = require("../config");

mongoose.Promise = global.Promise;

mongoose.connect(
  process.env.MONGO_URI || config.get("database:uri"),
  config.get("database:options")
);

mongoose.set("debug", config.get("database:debug"));

module.exports = mongoose;
