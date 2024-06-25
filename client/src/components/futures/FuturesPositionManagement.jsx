import PropTypes from 'prop-types';
import axios from 'axios';
import { useState, useEffect } from 'react';

const FuturesPositionManagement = ({ userId, positions, fetchPositions }) => {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [newLeverage, setNewLeverage] = useState(1);
  const [riskRate, setRiskRate] = useState(null);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    const fetchRiskRate = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/futuresTrading/users/${userId}/riskRate`);
        setRiskRate(response.data.riskRate);
        setBalance(response.data.balance);
      } catch (error) {
        console.error('Error fetching risk rate:', error);
      }
    };

    fetchRiskRate();
  }, [userId]);

  const handleClosePosition = async (positionId) => {
    try {
      await axios.post(`http://localhost:3000/api/futuresTrading/users/${userId}/positions/${positionId}/close`);
      fetchPositions();
    } catch (error) {
      console.error('Error closing position:', error);
    }
  };

  const handleAdjustLeverage = async (positionId) => {
    try {
      await axios.post(`http://localhost:3000/api/futuresTrading/users/${positionId}/leverage`, {
        leverage: newLeverage,
      });
      fetchPositions();
    } catch (error) {
      console.error('Error adjusting leverage:', error);
    }
  };

  return (
    <div>
      <h2>Futures Positions</h2>
      <div>
        <strong>Account Balance:</strong> {balance}
      </div>
      <div>
        <strong>Risk Rate:</strong> {riskRate}
      </div>
      <ul>
        {positions.map((position) => (
          <li key={position._id}>
            <div>
              <strong>Symbol:</strong> {position.symbol}
            </div>
            <div>
              <strong>Quantity:</strong> {position.quantity}
            </div>
            <div>
              <strong>Entry Price:</strong> {position.entryPrice}
            </div>
            <div>
              <strong>Current Price:</strong> {position.currentPrice}
            </div>
            <div>
              <strong>Leverage:</strong> {position.leverage}
            </div>
            <div>
              <strong>Unrealized P&L:</strong> {position.unrealizedPnL}
            </div>
            <button onClick={() => handleClosePosition(position._id)}>Close Position</button>
            <button onClick={() => setSelectedPosition(position)}>Adjust Leverage</button>
          </li>
        ))}
      </ul>
      {selectedPosition && (
        <div>
          <h3>Adjust Leverage for {selectedPosition.symbol}</h3>
          <input
            type="number"
            value={newLeverage}
            onChange={(e) => setNewLeverage(e.target.value)}
            min="1"
            required
          />
          <button onClick={() => handleAdjustLeverage(selectedPosition._id)}>Update Leverage</button>
        </div>
      )}
    </div>
  );
};

FuturesPositionManagement.propTypes = {
  userId: PropTypes.string.isRequired,
  positions: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      symbol: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
      entryPrice: PropTypes.number.isRequired,
      currentPrice: PropTypes.number.isRequired,
      leverage: PropTypes.number.isRequired,
      unrealizedPnL: PropTypes.number.isRequired,
    })
  ).isRequired,
  fetchPositions: PropTypes.func.isRequired,
};

export default FuturesPositionManagement;
