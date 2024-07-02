import { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Link,
  Paper,
  Box,
  Grid,
  Typography,
  Snackbar,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MuiAlert from "@mui/material/Alert";
import background from "../assets/register_p1.png";

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://www.cc-invest-cat.com">
        cc-invest-cat
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const theme = createTheme();

export default function Register() {
  const { register } = useContext(AuthContext);
  const [formState, setFormState] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  const handleSnackbarClose = () => {
    setSnackbar({ open: false, message: "", severity: "error" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const errorMessages = {
    "All fields are required": "所有欄位都是必填的",
    "Username or email already exists": "用戶名或電子郵件已存在",
    "Password requirements not met": "密碼不符合要求",
    "Invalid email or password": "無效的電子郵件或密碼",
    "Internal Server Error": "未知錯誤，請聯絡客服人員",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password } = formState;
    try {
      await register(username, email, password);
      setSnackbar({ open: true, message: "註冊成功", severity: "success" });
    } catch (error) {
      let errorMessage = "註冊失敗，請檢查輸入的信息。";
      if (error.response && error.response.data) {
        const serverMessage = error.response.data.message;
        errorMessage = errorMessages[serverMessage] || errorMessage;
      }
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid
        container
        component="main"
        sx={{ height: "100vh", backgroundColor: "#ffffff" }}
      >
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: `url(${background})`,
            backgroundRepeat: "no-repeat",
            backgroundColor: "white",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <Grid
          item
          xs={12}
          sm={8}
          md={5}
          component={Paper}
          elevation={0}
          square
          sx={{
            backgroundColor: "#ffffff",
            border: "none",
          }}
        >
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "#FFDC35" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              註冊
            </Typography>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ mt: 1 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="用戶名"
                name="username"
                autoComplete="username"
                autoFocus
                value={formState.username}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="電子郵件"
                name="email"
                autoComplete="email"
                value={formState.email}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="密碼"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formState.password}
                onChange={handleChange}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  backgroundColor: "#FFDC35",
                  color: "#000",
                  "&:hover": { backgroundColor: "#F7C400" },
                }}
              >
                註冊
              </Button>
              <Grid container>
                <Grid item>
                  <Link href="login" variant="body2">
                    {"已經有賬號了？ 登入"}
                  </Link>
                </Grid>
              </Grid>
              <Box mt={5}>
                <Copyright />
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </ThemeProvider>
  );
}
