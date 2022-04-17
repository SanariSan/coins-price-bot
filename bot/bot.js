import localtunnel from 'localtunnel';

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
  bot.command('gst', (ctx) => {
    ctx.reply('1');
  });
  bot.command('gmt', (ctx) => {
    ctx.reply('2');
  });
  bot.command('sol', (ctx) => {
    ctx.reply('3');
  });
  bot.on('text', async (ctx) => {
    ctx.reply('Run command to get current coin price');
  });
}

export { setupBotWebhook, setupBotActions };
