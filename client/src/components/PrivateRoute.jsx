import { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import PropTypes from "prop-types";
import { Box, Typography, CircularProgress, Container } from "@mui/material";

const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [countdown, setCountdown] = useState(3);

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
      <Container maxWidth="sm">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            請登入以訪問此頁面。
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            您將在 {countdown} 秒後被重定向到登入頁面。
          </Typography>
        </Box>
      </Container>
    );
  }

  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoute;
