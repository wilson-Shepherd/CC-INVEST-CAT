import { useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const FuturesAccountInfo = ({ userId }) => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/futuresTrading/users/${userId}/account`);
        setAccount(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Futures Account</h2>
      <p>Balance: ${account.balance}</p>
      <p>Used Margin: ${account.usedMargin}</p>
      <p>Total Equity: ${(parseFloat(account.balance) + parseFloat(account.unrealizedPnL)).toFixed(2)}</p>
      <p>Margin Rate: {((account.usedMargin / account.balance) * 100).toFixed(2)}%</p>
    </div>
  );
};

FuturesAccountInfo.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default FuturesAccountInfo;
