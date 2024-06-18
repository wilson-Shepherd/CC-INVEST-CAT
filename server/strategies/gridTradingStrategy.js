export function createGrid(lowerPrice, upperPrice, gridSize) {
    const grid = [];
    const step = (upperPrice - lowerPrice) / gridSize;
    for (let i = 0; i <= gridSize; i++) {
        grid.push(lowerPrice + i * step);
    }
    return grid;
}

export function gridTrading(data, lowerPrice, upperPrice, gridSize, initialBalance) {
    const grid = createGrid(lowerPrice, upperPrice, gridSize);
    let balance = initialBalance;
    let position = 0;
    let totalProfitLoss = 0;
    const balanceHistory = [];

    for (const dataPoint of data) {
        const price = dataPoint.close;

        for (let i = 0; i < grid.length - 1; i++) {
            if (price <= grid[i] && balance >= price) {
                const quantity = Math.floor(balance / price / gridSize);
                balance -= quantity * price;
                position += quantity;
                balanceHistory.push({
                    time: dataPoint.closeTime,
                    action: 'buy',
                    price: price,
                    balance: balance,
                    position: position,
                    profitLoss: null,
                    totalProfitLoss: totalProfitLoss
                });
                console.log(`Buy at ${price}`);
            } 
            else if (price >= grid[i + 1] && position > 0) {
                const quantity = Math.min(position, Math.floor(balance / price / gridSize));
                const profitLoss = quantity * (price - grid[i]);
                totalProfitLoss += profitLoss;
                balance += quantity * price;
                position -= quantity;
                balanceHistory.push({
                    time: dataPoint.closeTime,
                    action: 'sell',
                    price: price,
                    balance: balance,
                    position: position,
                    profitLoss: profitLoss,
                    totalProfitLoss: totalProfitLoss
                });
                console.log(`Sell at ${price}`);
            }
        }
    }

    if (position > 0) {
        const finalPrice = data[data.length - 1].close;
        const profitLoss = position * (finalPrice - grid[0]);
        totalProfitLoss += profitLoss;
        balance += position * finalPrice;
        balanceHistory.push({
            time: data[data.length - 1].closeTime,
            action: 'final sell',
            price: finalPrice,
            balance: balance,
            position: 0,
            profitLoss: profitLoss,
            totalProfitLoss: totalProfitLoss
        });
        position = 0;
    }

    return balanceHistory;
}
