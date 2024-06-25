import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import LiveData from './pages/LiveData';
import Kline from './pages/Kline';
import SpotTrading from './pages/SpotTrading';
import FuturesTrading from './pages/FuturesTrading';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import RedirectRoute from './components/RedirectRoute';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RedirectRoute><Register /></RedirectRoute>} />
          <Route path="/login" element={<RedirectRoute><Login /></RedirectRoute>} />
          <Route path="/spot-trading" element={<PrivateRoute><SpotTrading /></PrivateRoute>} />
          <Route path="/futures-trading" element={<PrivateRoute><FuturesTrading /></PrivateRoute>} />
          <Route path="/live-data" element={<LiveData />} />
          <Route path="/kline" element={<Kline />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
