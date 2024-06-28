import PropTypes from 'prop-types';

const SpotAccountInfo = ({ account }) => {
  const holdings = Object.entries(account.holdings);

  return (
    <div>
      <h2>Spot Account Info</h2>
      <div>
        <strong>Balance:</strong> {account.balance}
      </div>
      <div>
        <strong>Holdings:</strong>
        <ul>
          {holdings.map(([key, value]) => (
            <li key={key}>
              {key}: {value}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

SpotAccountInfo.propTypes = {
  account: PropTypes.shape({
    balance: PropTypes.number.isRequired,
    holdings: PropTypes.objectOf(PropTypes.number).isRequired,
  }).isRequired,
};

export default SpotAccountInfo;
