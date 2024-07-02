import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import LiveData from "./pages/LiveData";
import SpotTrading from "./pages/SpotTrading";
import FuturesTrading from "./pages/FuturesTrading";
import Admin from "./pages/Admin";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import RedirectRoute from "./components/RedirectRoute";
import { AuthProvider } from "./contexts/AuthContext";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/register"
            element={
              <RedirectRoute>
                <Register />
              </RedirectRoute>
            }
          />
          <Route
            path="/login"
            element={
              <RedirectRoute>
                <Login />
              </RedirectRoute>
            }
          />
          <Route
            path="/spot-trading"
            element={
              <PrivateRoute>
                <SpotTrading />
              </PrivateRoute>
            }
          />
          <Route
            path="/futures-trading"
            element={
              <PrivateRoute>
                <FuturesTrading />
              </PrivateRoute>
            }
          />
          <Route path="/admin" element={<Admin />} />
          <Route path="/live-data" element={<LiveData />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
};

export default App;
