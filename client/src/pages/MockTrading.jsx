import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import MockAccountInfo from '../components/MockAccountInfo';
import MockTradingForm from '../components/MockTradingForm';

const MockTrading = () => {
  const { user } = useContext(AuthContext);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    if (user) {
      fetchAccountData();
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

  const handleOrderSubmit = (newOrder) => {
    console.log('New order placed:', newOrder);
    fetchAccountData();
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
    </div>
  );
};

export default MockTrading;
