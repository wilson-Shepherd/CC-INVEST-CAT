import PropTypes from 'prop-types';

const MockOrderDetail = ({ order }) => {
  return (
    <div>
      <h2>Order Detail</h2>
      <div>
        <strong>Symbol:</strong> {order.symbol}
      </div>
      <div>
        <strong>Order Type:</strong> {order.orderType}
      </div>
      <div>
        <strong>Quantity:</strong> {order.quantity}
      </div>
      <div>
        <strong>Status:</strong> {order.status}
      </div>
      <div>
        <strong>Price:</strong> {order.price}
      </div>
      <div>
        <strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}
      </div>
    </div>
  );
};

MockOrderDetail.propTypes = {
  order: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    symbol: PropTypes.string.isRequired,
    orderType: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
};

export default MockOrderDetail;
