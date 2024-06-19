import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import LiveData from './pages/LiveData';
import HistoricalData from './pages/HistoricalData';
import Kline from './pages/Kline';
import MockTrading from './pages/MockTrading';
import Header from './components/Header';
import './App.css';

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/live-data" element={<LiveData />} />
        <Route path="/historical-data" element={<HistoricalData />} />
        <Route path="/kline" element={<Kline />} />
        <Route path="/mock-trading" element={<MockTrading />} />
      </Routes>
    </Router>
  );
};

export default App;
