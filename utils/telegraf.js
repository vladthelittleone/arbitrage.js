/**
 * @since 18.01.2018
 * @author Skurishin Vladislav
 */
const EntryModel = require("../models/entry");
const ExitModel = require("../models/exit");
const SpreadModel = require("../models/spread");
const Telegraf = require("telegraf");
const Markup = require('telegraf/markup');
const config = require("../config");
const lodash = require("lodash");
const bot = new Telegraf(config.get("telegram:key"));

const idsArray = [];
const logsMap = {};
const inoutMap = {};
const pathMap = {};

function loggerWrapper (module) {
  const logger = require('./log')(module);
  return {
    send:  send,
    inout: inout,
    path:  path,
    info:  send.bind(null, 'info'),
    warn:  send.bind(null, 'warn'),
    debug: send.bind(null, 'debug'),
    error: send.bind(null, 'error')
  };
  function send (type, msg) {
    logger[type](msg);
    lodash.forIn(logsMap, (ctx, id) => ctx.reply(msg));
  }

  function inout (msg) {
    logger.info(msg);
    lodash.forIn(logsMap, (ctx, id) => ctx.reply(msg));
    lodash.forIn(inoutMap, (ctx, id) => ctx.reply(msg));
  }

  function path (msg) {
    lodash.forIn(pathMap, (ctx, id) => ctx.reply(msg));
  }
}

bot.start((ctx) => {
  const keyboard = Markup.keyboard([
    ["/lastentry", "/lastexit"],
    ["/spreads", "/inout"],
    ["/logs", "/stop"],
    ["/path"]
  ]);
  return ctx.reply('Custom buttons keyboard', keyboard
    .resize()
    .extra());
});

bot.hears("QETadg135", (ctx) => {
  idsArray.push(ctx.from.id);
  return ctx.reply("You'r logged in!");
});

bot.command("lastentry", (ctx) => {
  if (check(ctx)) {
    EntryModel.findOne({}, {}, {sort: {'entryTime': -1}})
              .then((data) => {
                const {
                  exShortId,
                  exLongId,
                  entryTime,
                  priceLongIn,
                  priceShortIn,
                  pairName
                } = data;
                ctx.reply(`Last entry for ${pairName}: ${entryTime}.`);
                ctx.reply(`${exShortId}: ${priceShortIn.toFixed(4)}`);
                ctx.reply(`${exLongId}: ${priceLongIn.toFixed(4)}`);
              });
  }
});

bot.command("lastexit", (ctx) => {
  if (check(ctx)) {
    ExitModel.findOne({}, {}, {sort: {'exitTime': -1}})
             .then((data) => {
               const {
                 exShortId,
                 exLongId,
                 exitTime,
                 priceLongOut,
                 priceShortOut,
                 pairName
               } = data;
               ctx.reply(`Last exit for ${pairName}: ${exitTime}.`);
               ctx.reply(`${exShortId}: ${priceShortOut.toFixed(4)}`);
               ctx.reply(`${exLongId}: ${priceLongOut.toFixed(4)}`);
             });
  }
});

bot.command("spreads", (ctx) => {
  if (check(ctx)) {
    SpreadModel.find({}, {_id: 0, exShortId: 1, exLongId: 1, minSpread: 1, maxSpread: 1})
               .then((spreads) => {
                 for (const s of spreads) {
                   const {exLongId, exShortId, minSpread, maxSpread} = s;
                   ctx.reply(`${exShortId} - ${exLongId}: [min: ${minSpread.toFixed(4)}, max: ${maxSpread.toFixed(
                     4)}]`);
                 }
               }, (err) => {
                 ctx.reply(err.message);
               });
  }
});

bot.command("inout", (ctx) => {
  if (check(ctx)) {
    inoutMap[ctx.from.id] = ctx;
  }
});

bot.command("logs", (ctx) => {
  if (check(ctx)) {
    logsMap[ctx.from.id] = ctx;
  }
});

bot.command("path", (ctx) => {
  if (check(ctx)) {
    pathMap[ctx.from.id] = ctx;
  }
});

bot.command("stop", (ctx) => {
  delete logsMap[ctx.from.id];
  delete inoutMap[ctx.from.id];
  delete pathMap[ctx.from.id];
});

bot.startPolling();

module.exports = loggerWrapper;

function check (ctx) {
  if (lodash.includes(idsArray, ctx.from.id)) {
    return true;
  } else {
    ctx.reply("Please, enter password.");
  }
}
