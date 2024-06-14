import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import LiveData from './pages/LiveData';
import HistoricalData from './pages/HistoricalData';

const App = () => {
  return (
    <Router>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/register">Register</Link></li>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/live-data">Live Data</Link></li>
          <li><Link to="/historical-data">Historical Data</Link></li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/live-data" element={<LiveData />} />
        <Route path="/historical-data" element={<HistoricalData />} />
      </Routes>
    </Router>
  );
};

export default App;
