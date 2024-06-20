import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import MockAccountInfo from '../components/MockAccountInfo';

const MockTrading = () => {
  const { user } = useContext(AuthContext);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const fetchAccount = async () => {
      if (user) {
        try {
          const response = await axios.get(`http://localhost:3000/api/mockTrading/mockAccount/${user._id}`);
          setAccount(response.data);
        } catch (error) {
          console.error('Error fetching account data:', error);
        }
      }
    };

    fetchAccount();
  }, [user]);

  if (!user) {
    return <div>Please log in to view your mock account.</div>;
  }

  if (!account) {
    return <div>Loading...</div>;
  }

  return <MockAccountInfo account={account} />;
};

export default MockTrading;
