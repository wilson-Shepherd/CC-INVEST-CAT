import { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import io from "socket.io-client";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TablePagination,
  Box,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { styled } from "@mui/system";
import { FaBitcoin, FaEthereum } from "react-icons/fa";
import { SiBinance, SiSolana, SiRipple } from "react-icons/si";
import HotSaleIcon from "../assets/hot-sale.png";
import CrownIcon from "../assets/crown.png";

const socket = io(import.meta.env.API_BASE_URL);

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: "bold",
  fontSize: "1rem",
  color: "gray",
  borderBottom: "none",
  borderTop: "none",
  padding: theme.spacing(1),
}));

const StyledTableBodyCell = styled(TableCell)(({ theme }) => ({
  fontSize: "0.9rem",
  borderBottom: "none",
  borderTop: "none",
  padding: theme.spacing(1),
}));

const PositiveChange = styled("span")({
  color: "green",
  fontSize: "0.9rem",
});

const NegativeChange = styled("span")({
  color: "red",
  fontSize: "0.9rem",
});

const TitleContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  marginBottom: "1rem",
  marginTop: "2rem",
});

const Subtitle = styled(Typography)({
  fontWeight: "bold",
  color: "gray",
  fontSize: "1.8rem",
  marginLeft: "1rem",
});

const SectionContainer = styled("div")({
  marginBottom: "2rem",
});

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.2rem",
  color: "gray",
  fontWeight: "bold",
  marginBottom: theme.spacing(2),
}));

const TickerBox = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: theme.spacing(15),
  alignItems: "center",
  padding: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  "&:last-child": {
    borderBottom: "none",
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  "& svg": {
    width: "18px",
    height: "18px",
    marginRight: theme.spacing(1),
  },
  "& img": {
    width: "18px",
    height: "18px",
    marginLeft: theme.spacing(1),
  },
}));

const icons = {
  BTC: <FaBitcoin color="#F7931A" />,
  ETH: <FaEthereum color="#627EEA" />,
  BNB: <SiBinance color="#F3BA2F" />,
  SOL: <SiSolana color="#00FFA3" />,
  XRP: <SiRipple color="#23292F" />,
};

const formatNumber = (value) => {
  const units = [
    { value: 1e9, symbol: "B" },
    { value: 1e6, symbol: "M" },
    { value: 1e3, symbol: "K" },
  ];
  const unit = units.find((unit) => value >= unit.value) || {
    value: 1,
    symbol: "",
  };
  return `${(value / unit.value).toFixed(2)}${unit.symbol}`;
};

const TickerRow = ({ ticker }) => {
  const volume = parseFloat(ticker.q);
  const price = parseFloat(ticker.c);
  const marketCap = volume * price;
  const changePercent = parseFloat(ticker.P);

  const showHotSale = volume >= 1e9;
  const showCrown = changePercent >= 10;

  return (
    <TableRow>
      <StyledTableBodyCell component="th" scope="row">
        <IconWrapper>
          {ticker.s.replace("USDT", "")}
          {showHotSale && (
            <img
              src={HotSaleIcon}
              alt="Hot Sale"
              style={{ width: "16px", height: "16px", marginLeft: "4px" }}
            />
          )}
          {showCrown && (
            <img
              src={CrownIcon}
              alt="Crown"
              style={{ width: "14px", height: "14px", marginLeft: "4px" }}
            />
          )}
        </IconWrapper>
      </StyledTableBodyCell>
      <StyledTableBodyCell align="right">
        {price < 1 ? price : price.toFixed(2)}
      </StyledTableBodyCell>
      <StyledTableBodyCell align="right">
        {changePercent >= 0 ? (
          <PositiveChange>+{changePercent.toFixed(2)}%</PositiveChange>
        ) : (
          <NegativeChange>{changePercent.toFixed(2)}%</NegativeChange>
        )}
      </StyledTableBodyCell>
      <StyledTableBodyCell align="right">
        {formatNumber(volume)}
      </StyledTableBodyCell>
      <StyledTableBodyCell align="right">
        {formatNumber(marketCap)}
      </StyledTableBodyCell>
    </TableRow>
  );
};

TickerRow.propTypes = {
  ticker: PropTypes.shape({
    s: PropTypes.string.isRequired,
    c: PropTypes.string.isRequired,
    P: PropTypes.string.isRequired,
    q: PropTypes.string.isRequired,
  }).isRequired,
};

const TickerCard = ({ title, tickers }) => (
  <Card variant="outlined">
    <CardContent>
      <SectionTitle>{title}</SectionTitle>
      <TickerBox>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          名稱
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          價格
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          24h 漲跌
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          24h 成交量
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          市值
        </Typography>
      </TickerBox>
      {tickers.map((ticker) => {
        const volume = parseFloat(ticker.q);
        const price = parseFloat(ticker.c);
        const marketCap = volume * price;
        const changePercent = parseFloat(ticker.P);

        return (
          <TickerBox key={ticker.s}>
            <IconWrapper>
              {icons[ticker.s.replace("USDT", "")]}
              <Typography variant="body1">
                {ticker.s.replace("USDT", "")}
              </Typography>
            </IconWrapper>
            <Typography variant="body1">{formatNumber(price)}</Typography>
            <Typography
              variant="body1"
              style={{ color: changePercent >= 0 ? "green" : "red" }}
            >
              {changePercent >= 0
                ? `+${changePercent.toFixed(2)}%`
                : `${changePercent.toFixed(2)}%`}
            </Typography>
            <Typography variant="body1">{formatNumber(volume)}</Typography>
            <Typography variant="body1">{formatNumber(marketCap)}</Typography>
          </TickerBox>
        );
      })}
    </CardContent>
  </Card>
);

TickerCard.propTypes = {
  title: PropTypes.string.isRequired,
  tickers: PropTypes.arrayOf(
    PropTypes.shape({
      s: PropTypes.string.isRequired,
      c: PropTypes.string.isRequired,
      P: PropTypes.string.isRequired,
      q: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

function LiveData() {
  const [tickers, setTickers] = useState({});
  const [page, setPage] = useState(0);

  useEffect(() => {
    const handleTickerData = (data) => {
      setTickers((prevTickers) => ({ ...prevTickers, [data.s]: data }));
    };

    socket.on("tickerData", handleTickerData);
    return () => socket.off("tickerData", handleTickerData);
  }, []);

  const sortedTickers = useMemo(
    () =>
      Object.values(tickers).sort((a, b) => parseFloat(b.q) - parseFloat(a.q)),
    [tickers],
  );

  const popularTickers = useMemo(
    () =>
      sortedTickers.filter((ticker) =>
        ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT"].includes(
          ticker.s,
        ),
      ),
    [sortedTickers],
  );

  return (
    <Container>
      <TitleContainer>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", marginRight: "1rem" }}
          >
            市場總覽
          </Typography>
          <Subtitle>交易資料</Subtitle>
        </Box>
      </TitleContainer>

      <SectionContainer>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TickerCard title="熱門幣種" tickers={popularTickers} />
          </Grid>
        </Grid>
      </SectionContainer>

      <TableContainer
        component={Paper}
        sx={{ boxShadow: "none", border: "none" }}
      >
        <Table sx={{ "& .MuiTableCell-root": { borderBottom: "none" } }}>
          <TableHead>
            <TableRow>
              <StyledTableCell>名稱</StyledTableCell>
              <StyledTableCell align="right">價格</StyledTableCell>
              <StyledTableCell align="right">24h 漲跌</StyledTableCell>
              <StyledTableCell align="right">24h 成交量</StyledTableCell>
              <StyledTableCell align="right">市值</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedTickers.slice(page * 15, page * 15 + 15).map((ticker) => (
              <TickerRow key={ticker.s} ticker={ticker} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={sortedTickers.length}
        rowsPerPage={15}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPageOptions={[]}
        labelDisplayedRows={() => null}
        labelRowsPerPage={() => null}
      />
    </Container>
  );
}

export default LiveData;
