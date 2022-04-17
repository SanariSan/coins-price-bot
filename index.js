import express from 'express';
import { Telegraf } from 'telegraf';
import { setupBotActions, setupBotWebhook } from './bot';
import { setupServerActions } from './server';

async function init() {
  const { TELEGRAM_TOKEN } = process.env;

  const bot = new Telegraf(TELEGRAM_TOKEN);
  const webhookSecretPath = `/${bot.secretPathComponent()}`;

  await setupBotWebhook(bot, webhookSecretPath);
  await setupBotActions(bot);

  const app = express();
  setupServerActions(app, bot.webhookCallback(webhookSecretPath));
}

init();
