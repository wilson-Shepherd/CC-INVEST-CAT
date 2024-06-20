import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import LiveData from './pages/LiveData';
import HistoricalData from './pages/HistoricalData';
import Kline from './pages/Kline';
import MockTrading from './pages/MockTrading';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import RedirectRoute from './components/RedirectRoute';
import { AuthProvider } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import './App.css';

const App = () => {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<RedirectRoute element={<Register />} />} />
            <Route path="/login" element={<RedirectRoute element={<Login />} />} />
            <Route path="/mock-trading" element={<PrivateRoute element={<MockTrading />} />} />
            <Route path="/live-data" element={<LiveData />} />
            <Route path="/historical-data" element={<HistoricalData />} />
            <Route path="/kline" element={<Kline />} />
          </Routes>
        </Router>
      </WebSocketProvider>
    </AuthProvider>
  );
};

export default App;
