import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import PropTypes from 'prop-types';

const RedirectRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (user) {
    return <Navigate to="/mock-trading" />;
  }

  return children;
};

RedirectRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default RedirectRoute;
