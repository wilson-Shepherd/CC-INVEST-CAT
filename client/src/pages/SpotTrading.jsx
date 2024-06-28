import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import SpotAccountInfo from '../components/spot/SpotAccountInfo';
import SpotTradingForm from '../components/spot/SpotTradingForm';
import SpotOrdersList from '../components/spot/SpotOrdersList';
import SpotOrderDetail from '../components/spot/SpotOrderDetail';

const SpotTrading = () => {
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
      const response = await axios.get(`http://localhost:3000/api/spotTrading/users/${user._id}/account`);
      setAccount(response.data);
    } catch (error) {
      console.error('Error fetching account data:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/spotTrading/users/${user._id}/orders`);
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
    return <div>Please log in to view your spot account.</div>;
  }

  if (!account) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <SpotAccountInfo account={account} />
      <SpotTradingForm userId={user._id} onSubmit={handleOrderSubmit} />
      <SpotOrdersList orders={orders} onOrderClick={setSelectedOrder} />
      {selectedOrder && <SpotOrderDetail order={selectedOrder} />}
    </div>
  );
};

export default SpotTrading;
