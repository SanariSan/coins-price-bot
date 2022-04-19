import localtunnel from 'localtunnel';
import { getGmtRate, getGstRate, getSolRate } from '../requests';
import { log } from '../util';

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

function setupBotActions(bot) {
  bot.start((ctx) => {
    ctx.reply('Run command to get current coin price');
  });
  bot.command('gst', async (ctx) => {
    const res = await getGstRate().catch((e) => log(e));
    if (!res) ctx.reply('Try again later');
    else {
      log(res);
      ctx.reply(res);
    }
  });
  bot.command('gmt', async (ctx) => {
    const res = await getGmtRate().catch((e) => log(e));
    if (!res) ctx.reply('Try again later');
    else {
      log(res);
      ctx.reply(res);
    }
  });
  bot.command('sol', async (ctx) => {
    const res = await getSolRate().catch((e) => log(e));
    if (!res) ctx.reply('Try again later');
    else {
      log(res);
      ctx.reply(res);
    }
  });
}

export { setupBotWebhook, setupBotActions };
