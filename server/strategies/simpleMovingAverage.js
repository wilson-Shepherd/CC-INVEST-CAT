// server/strategies/simpleMovingAverage.js

export const calculateSignal = (data) => {
    const shortTermAvg = data.slice(-5).reduce((acc, val) => acc + val.close, 0) / 5;
    const longTermAvg = data.slice(-20).reduce((acc, val) => acc + val.close, 0) / 20;

    if (shortTermAvg > longTermAvg) {
        return {
            symbol: 'BTCUSDT',
            action: 'buy',
            quantity: 1
        };
    } else if (shortTermAvg < longTermAvg) {
        return {
            symbol: 'BTCUSDT',
            action: 'sell',
            quantity: 1
        };
    } else {
        return {
            action: 'hold'
        };
    }
};
