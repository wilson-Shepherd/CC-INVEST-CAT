import { Link as RouterLink } from "react-router-dom";
import { useState } from "react";
import {
  Button,
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  FaShieldAlt,
  FaLock,
  FaChartLine,
  FaCoins,
  FaClock,
  FaTools,
} from "react-icons/fa";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import landing_page from "../assets/landing_page.png";

const Home = () => {
  const [expandedFaq, setExpandedFaq] = useState(false);

  const handleFaqChange = (panel) => (event, isExpanded) => {
    setExpandedFaq(isExpanded ? panel : false);
  };

  return (
    <Box
      sx={{
        backgroundColor: "#FFFFFF",
        minHeight: "100vh",
        fontFamily: "Roboto, sans-serif",
        paddingBottom: "50px",
      }}
    >
      <Box sx={{ width: "100%", overflow: "hidden", textAlign: "center" }}>
        <img
          src={landing_page}
          alt="Landing Page Banner"
          style={{ width: "100%", height: "auto" }}
        />
      </Box>
      <Container maxWidth="md" sx={{ textAlign: "center", padding: "80px 0" }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: "bold",
            marginTop: "20px",
            fontFamily: "Montserrat, sans-serif",
            marginBottom: "40px",
          }}
        >
          從今天就開始無痛練習交易
        </Typography>
        <Button
          variant="contained"
          component={RouterLink}
          to="/register"
          sx={{
            backgroundColor: "#FFDC35",
            color: "#000000",
            "&:hover": { backgroundColor: "#F7C400" },
            padding: "15px 40px",
            fontSize: "24px",
            borderRadius: "30px",
            fontFamily: "Roboto, sans-serif",
          }}
        >
          立即註冊
        </Button>
      </Container>

      <Box
        sx={{
          backgroundColor: "#f5f5f5",
          paddingTop: "80px",
          paddingBottom: "80px",
          fontFamily: "Roboto, sans-serif",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: "50px",
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            開始交易只需三步
          </Typography>
          <Grid container spacing={6}>
            {[
              {
                step: "1",
                title: "註冊帳戶",
                description: "快速完成註冊，無需真實資金",
              },
              {
                step: "2",
                title: "尋找貨幣",
                description: "選擇你喜歡的加密貨幣，開始你的交易之旅",
              },
              {
                step: "3",
                title: "開始交易",
                description: "觀察市場走勢圖，把握交易買賣時機",
              },
            ].map((step, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    padding: "0 15px",
                  }}
                >
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: "bold",
                      color: "#FFDC35",
                      marginBottom: 2,
                      fontFamily: "Roboto, sans-serif",
                    }}
                  >
                    {step.step}
                  </Typography>
                  <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    sx={{
                      fontFamily: "Montserrat, sans-serif",
                      marginBottom: "20px",
                    }}
                  >
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container
        maxWidth="lg"
        sx={{ textAlign: "center", padding: "80px 0", marginBottom: "50px" }}
      >
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: "bold",
            marginBottom: "50px",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          為什麼選擇我們的系統學習交易？
        </Typography>
        <Grid container spacing={6}>
          {[
            {
              title: "模擬真實市場",
              description: "體驗真實市場環境，無風險學習",
              icon: <FaChartLine size={40} color="#FFDC35" />,
            },
            {
              title: "豐富的交易對",
              description: "350+ 種加密貨幣任你選擇",
              icon: <FaCoins size={40} color="#FFDC35" />,
            },
            {
              title: "實時行情數據",
              description: "與真實市場同步的即時數據",
              icon: <FaClock size={40} color="#FFDC35" />,
            },
            {
              title: "專業交易工具",
              description: "圖表分析、技術指標一應俱全",
              icon: <FaTools size={40} color="#FFDC35" />,
            },
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 3,
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ marginBottom: 2 }}>{feature.icon}</Box>
                  <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    sx={{
                      fontFamily: "Montserrat, sans-serif",
                      marginBottom: "20px",
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box
        sx={{
          backgroundColor: "#f5f5f5",
          padding: "80px 0",
          fontFamily: "Roboto, sans-serif",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: "50px",
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            您的安全是我們的首要任務
          </Typography>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <FaShieldAlt size={40} color="#FFDC35" />
                <Box sx={{ marginLeft: 3 }}>
                  <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    sx={{
                      fontFamily: "Montserrat, sans-serif",
                      marginBottom: "20px",
                    }}
                  >
                    銀行級別的安全措施
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    採用最先進的技術，保護您的個人信息和交易數據
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <FaLock size={40} color="#FFDC35" />
                <Box sx={{ marginLeft: 3 }}>
                  <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    sx={{
                      fontFamily: "Montserrat, sans-serif",
                      marginBottom: "20px",
                    }}
                  >
                    安全的模擬環境
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    在無風險的環境中練習交易，不用擔心資金損失
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ textAlign: "center", padding: "80px 0" }}>
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: "bold",
            marginBottom: "30px",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          準備好開始您的交易之旅了嗎？
        </Typography>
        <Button
          variant="contained"
          component={RouterLink}
          to="/register"
          sx={{
            backgroundColor: "#FFDC35",
            color: "#000000",
            "&:hover": { backgroundColor: "#F7C400" },
            padding: "15px 40px",
            fontSize: "24px",
            borderRadius: "30px",
            fontFamily: "Roboto, sans-serif",
          }}
        >
          立即免費體驗
        </Button>
      </Container>

      <Box
        sx={{
          backgroundColor: "#f5f5f5",
          padding: "80px 0",
          fontFamily: "Roboto, sans-serif",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: "50px",
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            常見問題
          </Typography>
          <Grid container spacing={2}>
            {[
              {
                question: "這個交易系統是免費的嗎？",
                answer:
                  "是的，我們的模擬交易系統完全免費。您可以無限制地使用所有功能，無需支付任何費用。",
              },
              {
                question: "我需要有交易經驗嗎？",
                answer:
                  "不需要。我們的系統適合所有級別的交易者，從初學者到專業人士都可以使用。我們提供了詳細的教程和指南，幫助您開始交易之旅。",
              },
              {
                question: "交易數據是實時的嗎？",
                answer:
                  "是的，我們的系統使用實時市場數據。這確保了您在進行模擬交易時，能夠體驗到與真實市場一致的行情變化。",
              },
              {
                question: "我可以在手機上使用這個系統嗎？",
                answer:
                  "當然可以。我們的系統採用響應式設計，可以在各種設備上完美運行，包括智能手機和平板電腦。",
              },
            ].map((faq, index) => (
              <Grid item xs={12} key={index}>
                <Accordion
                  expanded={expandedFaq === `panel${index}`}
                  onChange={handleFaqChange(`panel${index}`)}
                  sx={{
                    backgroundColor: "transparent",
                    boxShadow: "none",
                    "&:before": {
                      display: "none",
                    },
                    "& .MuiAccordionSummary-root": {
                      borderBottom: "1px solid #e0e0e0",
                    },
                    "& .MuiAccordionSummary-content": {
                      margin: "12px 0",
                    },
                    "& .MuiAccordionDetails-root": {
                      padding: "16px 0",
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: "#FFDC35" }} />}
                    aria-controls={`panel${index}bh-content`}
                    id={`panel${index}bh-header`}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        fontFamily: "Montserrat, sans-serif",
                      }}
                    >
                      {faq.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      sx={{
                        color: "#666",
                        paddingLeft: "16px",
                        fontFamily: "Roboto, sans-serif",
                      }}
                    >
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
