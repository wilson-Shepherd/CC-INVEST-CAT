import PropTypes from 'prop-types';

const MockTradingSummary = ({ account }) => {
  const totalHoldingsValue = account.holdingsValue.reduce((acc, curr) => acc + curr.value, 0);
  const totalValue = account.cash + totalHoldingsValue;

  return (
    <div>
      <h2>Account Summary</h2>
      <p>Cash: ${account.cash.toFixed(2)}</p>
      <p>Total Holdings Value: ${totalHoldingsValue.toFixed(2)}</p>
      <p>Total Account Value: ${totalValue.toFixed(2)}</p>
    </div>
  );
};

MockTradingSummary.propTypes = {
  account: PropTypes.shape({
    cash: PropTypes.number.isRequired,
    holdingsValue: PropTypes.arrayOf(
      PropTypes.shape({
        symbol: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default MockTradingSummary;
