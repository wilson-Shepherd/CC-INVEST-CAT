import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import FuturesAccountInfo from '../components/futures/FuturesAccountInfo';
import FuturesTradingForm from '../components/futures/FuturesTradingForm';
import FuturesOrdersList from '../components/futures/FuturesOrdersList';
import FuturesOrderDetail from '../components/futures/FuturesOrderDetail';
import FuturesPositions from '../components/futures/FuturesPositions';

const FuturesTrading = () => {
  const { user } = useContext(AuthContext);
  const [account, setAccount] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (user) {
      fetchAccountData();
      fetchOrders();
    }
  }, [user]);

  const fetchAccountData = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/futuresTrading/users/${user._id}/account`);
      setAccount(response.data);
    } catch (error) {
      console.error('Error fetching account data:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/futuresTrading/users/${user._id}/orders`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleOrderSubmit = (newOrder) => {
    console.log('New order placed:', newOrder);
    fetchAccountData();
    fetchOrders();
  };

  if (!user) {
    return <div>Please log in to view your futures account.</div>;
  }

  if (!account) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <FuturesAccountInfo userId={user._id} />
      <FuturesPositions userId={user._id} />
      <FuturesTradingForm userId={user._id} onSubmit={handleOrderSubmit} />
      <FuturesOrdersList orders={orders} onOrderClick={setSelectedOrder} />
      {selectedOrder && <FuturesOrderDetail order={selectedOrder} />}
    </div>
  );
};

export default FuturesTrading;
