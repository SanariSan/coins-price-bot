import { Telegraf } from 'telegraf';
import express from 'express';
const { NODE_ENV, TELEGRAM_TOKEN, PORT } = process.env;

if (TELEGRAM_TOKEN === undefined) throw new Error('TELEGRAM_TOKEN must be provided!');

const bot = new Telegraf(TELEGRAM_TOKEN);

// if (NODE_ENV === 'production') {
// }
const secretPath = `/telegraf/${bot.secretPathComponent()}`;

// Set telegram webhook
// npm install -g localtunnel && lt --port 3000
bot.telegram.setWebhook(`https://----.localtunnel.me${secretPath}`);

bot.start((ctx) => {
  ctx.reply('0');
});
bot.command('gst', (ctx) => {
  ctx.reply('1');
});
bot.on('text', async (ctx) => {
  ctx.reply('2');
});

const app = express();
const port = PORT || 3000;

// app.use(express.json());

app.get('/', (req, res) => res.send('Hello World!'));
// Set the bot API endpoint
app.use(bot.webhookCallback(secretPath));
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
