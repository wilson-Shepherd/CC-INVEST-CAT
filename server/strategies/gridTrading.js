export function gridTrading(historicalData, lowerPrice, upperPrice, gridSize, initialBalance) {
    const grid = createGrid(lowerPrice, upperPrice, gridSize);
    let balance = initialBalance;
    let position = 0;
    let totalProfitLoss = 0;
    const balanceHistory = [];
  
    console.log('Starting grid trading strategy...');
    console.log('Initial balance:', balance);
    console.log('Grid levels:', grid);
  
    historicalData.forEach(data => {
      const price = data.close;
      const time = data.closeTime;
      let actionTaken = false;
  
      console.log(`Processing data point - Time: ${new Date(time).toISOString()}, Price: ${price}`);
  
      for (let i = 0; i < grid.length - 1; i++) {
        const gridLower = grid[i];
        const gridUpper = grid[i + 1];
  
        if (price <= gridUpper && price > gridLower) {
          const quantity = Math.floor(balance / price / gridSize);
          if (quantity > 0) {
            balance -= quantity * price;
            position += quantity;
            balanceHistory.push({
              time,
              action: 'buy',
              price,
              balance,
              position,
              profitLoss: 0,
              totalProfitLoss
            });
            console.log(`Buy executed - Price: ${price}, Quantity: ${quantity}, New Balance: ${balance}, New Position: ${position}`);
            actionTaken = true;
          } else {
            console.log(`Insufficient funds to buy at price ${price}`);
          }
        } else if (price > gridUpper && position > 0) {
          const quantity = Math.min(position, Math.floor(position / gridSize));
          if (quantity > 0) {
            const profitLoss = quantity * (price - gridUpper);
            totalProfitLoss += profitLoss;
            balance += quantity * price;
            position -= quantity;
            balanceHistory.push({
              time,
              action: 'sell',
              price,
              balance,
              position,
              profitLoss,
              totalProfitLoss
            });
            console.log(`Sell executed - Price: ${price}, Quantity: ${quantity}, New Balance: ${balance}, New Position: ${position}, Profit/Loss: ${profitLoss}, Total P/L: ${totalProfitLoss}`);
            actionTaken = true;
          } else {
            console.log(`Insufficient position to sell at price ${price}`);
          }
        }
      }
  
      if (!actionTaken) {
        console.log('No action taken for this data point.');
      }
    });
  
    console.log('Grid trading strategy completed.');
    return balanceHistory;
  }
  
  
  export function createGrid(lowerPrice, upperPrice, gridSize) {
    const step = (upperPrice - lowerPrice) / gridSize;
    return Array.from({ length: gridSize + 1 }, (_, i) => lowerPrice + i * step);
  }
  