import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav>
      <ul className="navbar">
        <li><Link to="/">Home</Link></li>
        {!user && <li><Link to="/register">Register</Link></li>}
        {!user && <li><Link to="/login">Login</Link></li>}
        <li><Link to="/live-data">Live Data</Link></li>
        <li><Link to="/historical-data">Historical Data</Link></li>
        <li><Link to="/kline">Kline</Link></li>
        <li><Link to="/mock-trading">Mock Trading</Link></li>
        {user && <li><button onClick={handleLogout}>Logout</button></li>}
      </ul>
    </nav>
  );
};

export default Header;
