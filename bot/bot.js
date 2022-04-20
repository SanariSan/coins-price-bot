import localtunnel from 'localtunnel';
import { getGmtRate, getGstRate, getSolRate } from '../requests';
import { dir, log } from '../util';

async function setupBotWebhook(bot, webhookSecretPath) {
  const { NODE_ENV, APP_NAME, PORT } = process.env;
  let webhookURL;

  if (NODE_ENV === 'production') {
    webhookURL = `https://${APP_NAME}.herokuapp.com${webhookSecretPath}`;
  } else {
    const tunnel = await localtunnel({ port: PORT });
    webhookURL = `${tunnel.url}${webhookSecretPath}`;
  }

  bot.telegram.setWebhook(webhookURL);
}

function getInitChatTimestamps(timeout) {
  const initTime = Date.now() - timeout;
  const ts = {
    gst: initTime,
    gmt: initTime,
    sol: initTime,
  };

  return ts;
}

function setupBotActions(bot) {
  const { TIMEOUT_MINS } = process.env;
  const timeout = 1000 * 60 * TIMEOUT_MINS;
  const chats = {};

  bot.start((ctx) => {
    ctx.reply('Add me to chat and run command to get current coin prices');
  });

  // restrict price request in pm with bot
  bot.use((ctx, next) => {
    if (ctx.chat.type === 'private') return;
    return next();
  });

  // initialize own timestamps for every chat
  bot.use((ctx, next) => {
    if (!(ctx.chat.id in chats)) {
      chats[ctx.chat.id] = getInitChatTimestamps(timeout);

      log('New chat');
      log(ctx?.message?.chat);
    }

    return next();
  });

  bot.command('gst', async (ctx, next) => {
    await ctx.tg.deleteMessage(ctx.chat.id, ctx.message.message_id);

    log(ctx?.message);

    const nowLocal = Date.now();
    if (nowLocal - timeout < chats[ctx.chat.id].gst) return;
    chats[ctx.chat.id].gst = nowLocal;

    ctx.res = getGstRate().catch((e) => log(e));
    // ctx.res = Promise.resolve().then(() => 'Current gst price: 4.49 usd');

    return next();
  });

  bot.command('gmt', async (ctx, next) => {
    await ctx.tg.deleteMessage(ctx.chat.id, ctx.message.message_id);

    log(ctx?.message);

    const nowLocal = Date.now();
    if (nowLocal - timeout < chats[ctx.chat.id].gmt) return;
    chats[ctx.chat.id].gmt = nowLocal;

    ctx.res = getGmtRate().catch((e) => log(e));
    // ctx.res = Promise.resolve().then(() => 'Current gmt price: 3.69 usd');

    return next();
  });

  bot.command('sol', async (ctx, next) => {
    await ctx.tg.deleteMessage(ctx.chat.id, ctx.message.message_id);

    log(ctx?.message);

    const nowLocal = Date.now();
    if (nowLocal - timeout < chats[ctx.chat.id].sol) return;
    chats[ctx.chat.id].sol = nowLocal;

    ctx.res = getSolRate().catch((e) => log(e));
    // ctx.res = Promise.resolve().then(() => 'Current sol price: 106.44 usd');

    return next();
  });

  // general response processor
  bot.use(async (ctx) => {
    const res = await ctx.res;

    if (res) {
      log('\n-\n');
      ctx.reply(res).catch((e) => log(e));
    }
  });
}

export { setupBotWebhook, setupBotActions };
