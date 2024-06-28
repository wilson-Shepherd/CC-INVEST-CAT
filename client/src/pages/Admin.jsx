import { useEffect, useState } from 'react';
import axios from 'axios';

const Admin = () => {
  const [orderFees, setOrderFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [serverError, setServerError] = useState(false);

  useEffect(() => {
    const fetchOrderFees = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/admin/order-fees', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(response.data);
        setOrderFees(response.data);
      } catch (err) {
        if (err.response) {
          if (err.response.status === 403) {
            setUnauthorized(true);
          } else if (err.response.status === 404) {
            setNotFound(true);
          } else if (err.response.status === 500) {
            setServerError(true);
          } else {
            setError(err.message);
          }
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderFees();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (unauthorized) return <div>You do not have admin privileges.</div>;
  if (notFound) return <div>User not found.</div>;
  if (serverError) return <div>Internal server error.</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Admin Metrics</h1>
      <h2>Order Fees</h2>
      <ul>
        {orderFees.map((fee, index) => (
          <li key={index}>
            <div><strong>Username:</strong> {fee.username}</div>
            <div><strong>Spot Order Fees:</strong> {fee.spotOrderFees}</div>
            <div><strong>Futures Order Fees:</strong> {fee.futuresOrderFees}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Admin;
