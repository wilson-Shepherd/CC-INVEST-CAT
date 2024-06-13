import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import LiveUpdate from './pages/liveUpdate';
import HistoricalUpdate from './pages/historicalUpdate';

const App = () => {
  return (
    <Router>
      <nav>
        <ul>
          <li><Link to="/live-update">Live Update</Link></li>
          <li><Link to="/historical-update">Historical Update</Link></li>
        </ul>
      </nav>
      <Routes>
        <Route path="/live-update" element={<LiveUpdate />} />
        <Route path="/historical-update" element={<HistoricalUpdate />} />
      </Routes>
    </Router>
  );
};

export default App;
