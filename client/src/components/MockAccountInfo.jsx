import PropTypes from 'prop-types';

const MockAccountInfo = ({ account }) => {
  return (
    <div>
      <h1>Mock Account</h1>
      <p>Cash: ${account.cash}</p>
      <h2>Holdings:</h2>
      <ul>
        {Object.keys(account.holdings).map(symbol => (
          <li key={symbol}>
            {symbol.toUpperCase()}: {account.holdings[symbol]}
          </li>
        ))}
      </ul>
    </div>
  );
};

MockAccountInfo.propTypes = {
  account: PropTypes.shape({
    cash: PropTypes.number.isRequired,
    holdings: PropTypes.object.isRequired,
  }).isRequired,
};

export default MockAccountInfo;
