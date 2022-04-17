import fetch from 'isomorphic-fetch';
import { stringify } from 'querystring';

async function requestCoinPrice(coinId) {
  const { COINMARKETCAP_TOKEN } = process.env;

  const response = await fetch(
    `https://pro-api.coinmarketcap.com/v2/tools/price-conversion?${stringify({
      amount: 1,
      id: coinId,
      convert: 'USD',
    })}`,
    {
      headers: {
        'X-CMC_PRO_API_KEY': COINMARKETCAP_TOKEN,
      },
    },
  ).catch((e) => {
    console.log(e);
  });
  if (!response) throw new Error('Error in request');

  return response.json();
}

function parseCoinPrice(body) {
  const price = body?.data?.quote?.USD?.price;
  if (price === undefined) throw new Error('Error in parsing');

  return `Current price: ${Number.parseFloat(price).toFixed(2)} usd`;
}

function getGstRate() {
  return requestCoinPrice('16352').then(parseCoinPrice);
}

function getGmtRate() {
  return requestCoinPrice('18069').then(parseCoinPrice);
}

function getSolRate() {
  return requestCoinPrice('5426').then(parseCoinPrice);
}

export { getGstRate, getGmtRate, getSolRate };
