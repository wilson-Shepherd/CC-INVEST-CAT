import { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import PropTypes from 'prop-types';

const PrivateRoute = ({ element }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!user) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [user]);

  if (!user) {
    if (countdown === 0) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return (
      <div>
        <p>Please log in to access this page. You will be redirected to the login page in {countdown} seconds.</p>
      </div>
    );
  }

  return element;
};

PrivateRoute.propTypes = {
  element: PropTypes.element.isRequired,
};

export default PrivateRoute;
