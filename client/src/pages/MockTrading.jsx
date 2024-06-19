import { useState, useEffect } from 'react';
import MockTradingForm from '../components/MockTradingForm';
import MockTradingSummary from '../components/MockTradingSummary';

const MockTrading = () => {
  const [account, setAccount] = useState(null);
  const userId = '12345'; // Replace with actual user ID

  useEffect(() => {
    fetch(`/api/mockTrading/mockAccount/${userId}`)
      .then(response => response.json())
      .then(data => setAccount(data))
      .catch(error => console.error(error));
  }, []);

  const addTrade = (newTrade) => {
    setAccount(prevAccount => ({
      ...prevAccount,
      // Update logic for cash and holdings
    }));
  };

  return (
    <div>
      <h1>Mock Trading</h1>
      {account && <MockTradingSummary account={account} />}
      <MockTradingForm addTrade={addTrade} />
    </div>
  );
};

export default MockTrading;
