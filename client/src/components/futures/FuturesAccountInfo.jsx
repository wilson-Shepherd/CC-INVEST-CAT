import PropTypes from 'prop-types';

const FuturesAccountInfo = ({ account }) => {
  const positions = Object.entries(account.positions);

  return (
    <div>
      <h2>Futures Account Info</h2>
      <div>
        <strong>Balance:</strong> {account.balance}
      </div>
      <div>
        <strong>Positions:</strong>
        <ul>
          {positions.map(([key, value]) => (
            <li key={key}>
              {key}: {value}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

FuturesAccountInfo.propTypes = {
  account: PropTypes.shape({
    balance: PropTypes.number.isRequired,
    positions: PropTypes.objectOf(PropTypes.number).isRequired,
  }).isRequired,
};

export default FuturesAccountInfo;
