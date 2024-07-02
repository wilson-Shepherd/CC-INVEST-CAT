import { useContext } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppBar
      position="static"
      sx={{ backgroundColor: "#ffffff", color: "#000000", boxShadow: "none" }}
    >
      <Toolbar>
        <IconButton color="inherit" component={RouterLink} to="/">
          <HomeIcon sx={{ color: "#FFDC35" }} />
        </IconButton>
        <Button
          color="inherit"
          component={RouterLink}
          to="/live-data"
          sx={{ marginLeft: 1 }}
        >
          市場
        </Button>
        <Button
          color="inherit"
          component={RouterLink}
          to="/spot-trading"
          sx={{ marginLeft: 1 }}
        >
          現貨
        </Button>
        <Button
          color="inherit"
          component={RouterLink}
          to="/futures-trading"
          sx={{ marginLeft: 1 }}
        >
          期貨
        </Button>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} />
        {!user ? (
          <>
            <IconButton color="inherit" sx={{ cursor: "default" }}>
              <AccountCircleIcon />
            </IconButton>
            <Button
              color="inherit"
              component={RouterLink}
              to="/login"
              sx={{
                backgroundColor: "#e0e0e0",
                color: "#000000",
                marginLeft: 1,
                "&:hover": { backgroundColor: "#bdbdbd" },
              }}
            >
              登錄
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/register"
              sx={{
                backgroundColor: "#FFDC35",
                color: "#000000",
                marginLeft: 1,
                "&:hover": { backgroundColor: "#f9dc67" },
              }}
            >
              註冊
            </Button>
          </>
        ) : (
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ marginLeft: 1 }}
          >
            登出
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
