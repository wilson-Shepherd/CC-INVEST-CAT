import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <nav>
      <ul className="navbar">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/register">Register</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/live-data">Live Data</Link></li>
        <li><Link to="/historical-data">Historical Data</Link></li>
        <li><Link to="/kline">Kline</Link></li>
      </ul>
    </nav>
  );
};

export default Header;
