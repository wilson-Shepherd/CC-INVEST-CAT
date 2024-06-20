import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import useWebSocketContext from '../hooks/useWebSocketContext.jsx';

const MockDashboard = ({ initialAccount }) => {
  const ws = useWebSocketContext();
  const [account, setAccount] = useState(initialAccount);
  const [currentPrices, setCurrentPrices] = useState({
    btc: 0,
    eth: 0,
    usdt: 1,
  });

  useEffect(() => {
    if (ws) {
      ws.send(JSON.stringify({ type: 'getAccountData' }));

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'accountData') {
          setAccount(data.account);
        }
      };
    }
  }, [ws]);

  useEffect(() => {
    const fetchCurrentPrices = async () => {
      try {
        const response = await fetch('/api/mockTrading/prices');
        const prices = await response.json();
        setCurrentPrices(prices);
      } catch (error) {
        console.error('Failed to fetch current prices:', error);
      }
    };

    fetchCurrentPrices();

    const interval = setInterval(fetchCurrentPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const { cash, holdings } = account;

  const calculateTotalAssets = () => {
    let totalHoldingsValue = 0;
    for (const [symbol, amount] of Object.entries(holdings)) {
      totalHoldingsValue += amount * (currentPrices[symbol] || 0);
    }
    return cash + totalHoldingsValue;
  };

  const totalAssets = calculateTotalAssets();

  return (
    <div>
      <h2>Mock Dashboard</h2>
      <p>Cash: ${cash.toFixed(2)}</p>
      <h3>Holdings</h3>
      <ul>
        {Object.entries(holdings).map(([symbol, amount]) => (
          <li key={symbol}>{symbol.toUpperCase()}: {amount}</li>
        ))}
      </ul>
      <h3>Total Assets: ${totalAssets.toFixed(2)}</h3>
    </div>
  );
};

MockDashboard.propTypes = {
  initialAccount: PropTypes.shape({
    cash: PropTypes.number.isRequired,
    holdings: PropTypes.object.isRequired,
  }).isRequired,
};

export default MockDashboard;
