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
        {!user && (
          <>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/login">Login</Link></li>
          </>
        )}
        <li><Link to="/live-data">Live Data</Link></li>
        <li><Link to="/kline">Kline</Link></li>
        {user && (
          <>
            <li><Link to="/spot-trading">Spot Trading</Link></li>
            <li><Link to="/futures-trading">Futures Trading</Link></li>
            <li><button onClick={handleLogout}>Logout</button></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Header;
