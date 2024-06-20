import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import PropTypes from 'prop-types';

const RedirectRoute = ({ element }) => {
  const { user } = useContext(AuthContext);

  if (user) {
    return <Navigate to="/" replace />;
  }

  return element;
};

RedirectRoute.propTypes = {
  element: PropTypes.element.isRequired,
};

export default RedirectRoute;
