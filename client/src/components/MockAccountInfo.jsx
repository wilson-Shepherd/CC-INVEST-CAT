import PropTypes from 'prop-types';

const MockAccountInfo = ({ account }) => {
  const holdings = Object.entries(account.holdings);

  return (
    <div>
      <h2>Mock Account Info</h2>
      <div>
        <strong>Cash:</strong> {account.cash}
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

MockAccountInfo.propTypes = {
  account: PropTypes.shape({
    cash: PropTypes.number.isRequired,
    holdings: PropTypes.objectOf(PropTypes.number).isRequired,
  }).isRequired,
};

export default MockAccountInfo;
