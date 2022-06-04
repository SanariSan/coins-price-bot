import localtunnel from 'localtunnel';
import { getGmtRate, getGstSolRate, getGstBscRate, getSolRate } from '../requests';
import { dir, log } from '../util';
import { appendFile } from 'fs/promises';

async function setupBotWebhook(bot, webhookSecretPath) {
  const { NODE_ENV, APP_NAME, PORT } = process.env;
  let webhookURL;

  if (NODE_ENV === 'production') {
    webhookURL = `https://${APP_NAME}.herokuapp.com${webhookSecretPath}`;
  } else {
    const tunnel = await localtunnel({ port: PORT }).catch((e) => {
      console.log(e);
    });
    webhookURL = `${tunnel.url}${webhookSecretPath}`;
  }

  bot.telegram.setWebhook(webhookURL);
}

function getInitChatTimestamps(timeout) {
  const initTime = Date.now() - timeout;
  const ts = {
    gst_sol: initTime,
    gst_bsc: initTime,
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

  bot.command('gst_sol', async (ctx, next) => {
    await ctx.tg.deleteMessage(ctx.chat.id, ctx.message.message_id);

    const nowLocal = Date.now();
    if (nowLocal - timeout < chats[ctx.chat.id].gst_sol) return;
    chats[ctx.chat.id].gst_sol = nowLocal;

    ctx.res = getGstSolRate().catch((e) => log(e));
    // ctx.res = Promise.resolve().then(() => 'Current gst price: 4.49 usd');

    return next();
  });

  bot.command('gst_bsc', async (ctx, next) => {
    await ctx.tg.deleteMessage(ctx.chat.id, ctx.message.message_id);

    const nowLocal = Date.now();
    if (nowLocal - timeout < chats[ctx.chat.id].gst_bsc) return;
    chats[ctx.chat.id].gst_bsc = nowLocal;

    ctx.res = getGstBscRate().catch((e) => log(e));

    return next();
  });

  bot.command('gmt', async (ctx, next) => {
    await ctx.tg.deleteMessage(ctx.chat.id, ctx.message.message_id);

    const nowLocal = Date.now();
    if (nowLocal - timeout < chats[ctx.chat.id].gmt) return;
    chats[ctx.chat.id].gmt = nowLocal;

    ctx.res = getGmtRate().catch((e) => log(e));
    // ctx.res = Promise.resolve().then(() => 'Current gmt price: 3.69 usd');

    return next();
  });

  bot.command('sol', async (ctx, next) => {
    await ctx.tg.deleteMessage(ctx.chat.id, ctx.message.message_id);

    const nowLocal = Date.now();
    if (nowLocal - timeout < chats[ctx.chat.id].sol) return;
    chats[ctx.chat.id].sol = nowLocal;

    ctx.res = getSolRate().catch((e) => log(e));
    // ctx.res = Promise.resolve().then(() => 'Current sol price: 106.44 usd');

    return next();
  });

  bot.on('text', async (ctx, next) => {
    const { NODE_ENV } = process.env;

    if (NODE_ENV === 'development') {
      await appendFile('./messages.log', `${new Date()} | ${JSON.stringify(ctx?.message)}\n`).catch(
        () => {},
      );
    }

    if (
      ctx?.message?.text &&
      (~ctx.message.text.toLowerCase().indexOf('бесплатные кроссовки') ||
        ~ctx.message.text.toLowerCase().indexOf('первые 100') ||
        ctx.message.from.first_name === 'Stepn')
    ) {
      log(ctx?.message);
      log(ctx.message.from.id);

      await ctx.tg.deleteMessage(ctx.chat.id, ctx.message.message_id).catch(() => {});
      // await ctx.tg.banChatMember(ctx.chat.id, ctx.message.from.id).catch((e) => {
      //   console.log(e);
      // });
    }

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
