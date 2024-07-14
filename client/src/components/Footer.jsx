import { Box, Container, Grid, Link, Typography } from "@mui/material";
import DiscordIcon from "../assets/discord.png";
import FacebookIcon from "../assets/facebook.png";

const Footer = () => {
  const discordInviteLink = "https://discord.gg/DFVVpHnDxv";
  const facebookLink = "https://www.facebook.com";

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "#ffffff",
        py: 4,
        borderTop: "1px solid #e0e0e0",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              社區
            </Typography>
            <Link
              href={discordInviteLink}
              target="_blank"
              rel="noopener"
              sx={{
                display: "flex",
                alignItems: "center",
                color: "inherit",
                mb: 1,
                textDecoration: "none",
              }}
            >
              <Box
                component="img"
                src={DiscordIcon}
                alt="Discord"
                sx={{ width: 18, height: 18, mr: 1 }}
              />
              <Typography variant="body2">Discord</Typography>
            </Link>
            <Link
              href={facebookLink}
              target="_blank"
              rel="noopener"
              sx={{
                display: "flex",
                alignItems: "center",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <Box
                component="img"
                src={FacebookIcon}
                alt="Facebook"
                sx={{ width: 18, height: 18, mr: 1 }}
              />
              <Typography variant="body2">Facebook</Typography>
            </Link>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              關於我們
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              品牌故事
            </Typography>
            <Typography variant="body2">加入咖資貓</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              模擬交易
            </Typography>
            <Link
              href="/spot-trading"
              sx={{
                display: "flex",
                alignItems: "center",
                color: "inherit",
                mb: 1,
                textDecoration: "none",
              }}
            >
              <Typography variant="body2">現貨</Typography>
            </Link>
            <Link
              href="/futures-trading"
              sx={{
                display: "flex",
                alignItems: "center",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <Typography variant="body2">期貨</Typography>
            </Link>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              聯絡我們
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              電郵: support@cc-invest-cat.com
            </Typography>
            <Typography variant="body2">電話: +123 456 7890</Typography>
          </Grid>
        </Grid>
        <Box mt={4} textAlign="center">
          <Typography variant="body2" color="textSecondary">
            {"版權所有 © "}
            <Link
              color="inherit"
              href="https://www.cc-invest-cat.com"
              sx={{ textDecoration: "none" }}
            >
              cc-invest-cat
            </Link>{" "}
            {new Date().getFullYear()}
            {"。"}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
