import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import MockAccountInfo from '../components/MockAccountInfo';
import MockTradingForm from '../components/MockTradingForm';
import MockOrdersList from '../components/MockOrdersList';
import MockOrderDetail from '../components/MockOrderDetail';

const MockTrading = () => {
  const { user } = useContext(AuthContext);
  const [account, setAccount] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderDetail, setOrderDetail] = useState(null);

  useEffect(() => {
    if (user) {
      fetchAccountData();
      fetchOrders();
    }
  }, [user]);

  const fetchAccountData = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/mockTrading/users/${user._id}/mockAccount`);
      setAccount(response.data);
    } catch (error) {
      console.error('Error fetching account data:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/mockTrading/users/${user._id}/mockOrders`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchOrderDetail = async (orderId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/mockTrading/users/${user._id}/mockOrders/${orderId}`);
      setOrderDetail(response.data);
    } catch (error) {
      console.error('Error fetching order detail:', error);
    }
  };

  const handleOrderSubmit = (newOrder) => {
    console.log('New order placed:', newOrder);
    fetchAccountData();
    fetchOrders();
  };

  if (!user) {
    return <div>Please log in to view your mock account.</div>;
  }

  if (!account) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <MockAccountInfo account={account} />
      <MockTradingForm userId={user._id} onSubmit={handleOrderSubmit} />
      <MockOrdersList orders={orders} onSelectOrder={fetchOrderDetail} />
      {orderDetail && <MockOrderDetail order={orderDetail} />}
    </div>
  );
};

export default MockTrading;
