import { getAccountBalance, getBTCUSDPrice, getMyTrades } from './utils/tradingUtils.js';

async function checkBalances() {
  try {
    const { BTC, USDT } = await getAccountBalance();
    const btcPriceInUSD = await getBTCUSDPrice();
    
    const totalBTCInUSD = BTC * btcPriceInUSD;
    const totalUSDTInUSD = USDT;
    const totalAssetsInUSD = totalBTCInUSD + totalUSDTInUSD;

    console.log(`BTC in USD: ${totalBTCInUSD}`);
    console.log(`USDT: ${totalUSDTInUSD}`);
    console.log(`Total Assets in USD: ${totalAssetsInUSD}`);

    // const trades = await getMyTrades('BTCUSDT');
    // console.log('Trade History:');
    // trades.forEach(trade => {
    //   const formattedTime = new Date(trade.time).toLocaleString();
    //   console.log(`ID: ${trade.id}, Symbol: ${trade.symbol}, Price: ${trade.price}, Qty: ${trade.qty}, Side: ${trade.side}, Time: ${formattedTime}`);
    // });
  } catch (error) {
    console.error('Error fetching account balance or trade history:', error);
  }
}

checkBalances();
