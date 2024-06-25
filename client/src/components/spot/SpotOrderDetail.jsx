import PropTypes from 'prop-types';

const SpotOrderDetail = ({ order }) => {
  return (
    <div>
      <h2>Order Detail</h2>
      <p><strong>Symbol:</strong> {order.symbol}</p>
      <p><strong>Order Type:</strong> {order.orderType}</p>
      <p><strong>Quantity:</strong> {order.quantity}</p>
      <p><strong>Status:</strong> {order.status}</p>
      <p><strong>Price:</strong> {order.price}</p>
      <p><strong>Fee:</strong> {order.fee}</p>
      <p><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
    </div>
  );
};

SpotOrderDetail.propTypes = {
  order: PropTypes.shape({
    symbol: PropTypes.string.isRequired,
    orderType: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    fee: PropTypes.number.isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
};

export default SpotOrderDetail;
