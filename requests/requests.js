import fetch from 'isomorphic-fetch';
import { stringify } from 'querystring';
import { strError } from '../util';

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
    throw strError(e, 'Error in request');
  });

  return response.json();
}

function parseCoinPrice(body) {
  const price = body?.data?.quote?.USD?.price;
  if (price === undefined) throw strError(new Error('Error in parsing'), JSON.stringify(body));

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
