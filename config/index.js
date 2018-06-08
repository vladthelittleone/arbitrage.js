/**
 * @since 03.02.16
 * @author Skurishin Vladislav
 */
const nconf = require("nconf");
const path = require("path");

nconf.argv()
     .env()
     .file({
       file: path.join(__dirname, "config.json")
     });

module.exports = nconf;
