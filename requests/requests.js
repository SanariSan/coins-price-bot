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

function parseCoinPrice(body, coinName) {
  const price = body?.data?.quote?.USD?.price;
  if (price === undefined) throw strError(new Error('Error in parsing'), JSON.stringify(body));

  return `Current ${coinName} price: ${Number.parseFloat(price).toFixed(2)} usd`;
}

function getGstRate() {
  return requestCoinPrice('16352').then((body) => parseCoinPrice(body, 'gst'));
}

function getGmtRate() {
  return requestCoinPrice('18069').then((body) => parseCoinPrice(body, 'gmt'));
}

function getSolRate() {
  return requestCoinPrice('5426').then((body) => parseCoinPrice(body, 'sol'));
}

export { getGstRate, getGmtRate, getSolRate };
