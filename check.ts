import axios from 'axios';
async function run() {
  const { data } = await axios.get('https://fapi.binance.com/fapi/v1/ticker/24hr');
  const usdtPairs = data.filter((p: any) => p.symbol.endsWith('USDT') && parseFloat(p.lastPrice) > 0);
  console.log(usdtPairs.length);
}
run();
