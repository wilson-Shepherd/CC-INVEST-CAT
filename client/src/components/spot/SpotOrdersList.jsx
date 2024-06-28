import PropTypes from 'prop-types';

const SpotOrdersList = ({ orders, onOrderClick }) => {
  return (
    <div>
      <h2>All Orders</h2>
      <ul>
        {orders.map((order) => (
          <li key={order._id} onClick={() => onOrderClick(order)}>
            {order.symbol} - {order.orderType} - {order.quantity} - {order.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

SpotOrdersList.propTypes = {
  orders: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      symbol: PropTypes.string.isRequired,
      orderType: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
    })
  ).isRequired,
  onOrderClick: PropTypes.func.isRequired,
};

export default SpotOrdersList;
