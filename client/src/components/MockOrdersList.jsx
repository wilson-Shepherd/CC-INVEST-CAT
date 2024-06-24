import PropTypes from 'prop-types';

const MockOrdersList = ({ orders, onSelectOrder }) => {
  return (
    <div>
      <h2>All Orders</h2>
      <ul>
        {orders.map((order) => (
          <li key={order._id}>
            <span onClick={() => onSelectOrder(order._id)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
              {order.symbol}
            </span> - {order.orderType} - {order.quantity} - {order.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

MockOrdersList.propTypes = {
  orders: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      symbol: PropTypes.string.isRequired,
      orderType: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
    })
  ).isRequired,
  onSelectOrder: PropTypes.func.isRequired,
};

export default MockOrdersList;
