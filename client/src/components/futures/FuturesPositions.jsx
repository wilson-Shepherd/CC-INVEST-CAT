import { useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const FuturesPositions = ({ userId }) => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/futuresTrading/users/${userId}/positions`);
        setPositions(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, [userId]);

  const closePosition = async (positionId) => {
    try {
      await axios.post(`http://localhost:3000/api/futuresTrading/users/${userId}/positions/${positionId}/close`);
      setPositions(positions.filter(position => position._id !== positionId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Futures Positions</h2>
      <ul>
        {positions.map(position => (
          <li key={position._id}>
            <p>Symbol: {position.symbol}</p>
            <p>Quantity: {position.quantity}</p>
            <p>Entry Price: ${position.entryPrice}</p>
            <p>Leverage: {position.leverage}</p>
            <p>Position Type: {position.positionType === 'long' ? 'Long' : 'Short'}</p>
            <p>Current Price: ${position.currentPrice}</p>
            <p>Unrealized PnL: ${position.unrealizedPnL}</p>
            <button onClick={() => closePosition(position._id)}>Close Position</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

FuturesPositions.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default FuturesPositions;
