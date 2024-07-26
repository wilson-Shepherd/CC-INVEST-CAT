import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./models/database.js";
import tickerRoutes, { initWebSocketRoutes } from "./routes/ticker.js";
import userRoutes from "./routes/user.js";
import spotTradingRoutes from "./routes/spot.js";
import futuresTradingRoutes from "./routes/futures.js";
import adminRoutes from "./routes/admin.js";
import { errorHandler } from "./utils/errorHandler.js";
import "./utils/orderScheduler.js";
// import {
//   initKafkaProducer,
//   closeKafkaProducer,
// } from "./services/kafka/service.js";
// import { initPriceNotificationScheduler } from "./services/discordBot/kafkaProducer.js";
import { streamTickerData } from "./controllers/ticker.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://app.cc-invest-cat.com", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

const PORT = process.env.PORT || 3000;

connectDB();

async function initialize() {
  try {
    // await initKafkaProducer();
    // initPriceNotificationScheduler();

    app.use(
      cors({
        origin: ["https://app.cc-invest-cat.com", "http://localhost:5173"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
      }),
    );

    app.use(express.json());
    app.use(errorHandler);

    app.use("/health", (req, res) => {
      res.send("ok");
    });
    app.use("/api/tickers", tickerRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/spot", spotTradingRoutes);
    app.use("/api/futures", futuresTradingRoutes);
    app.use("/api/admin", adminRoutes);

    initWebSocketRoutes();

    io.on("connection", (socket) => {
      streamTickerData(io);
    });

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize application:", error);
    throw new Error("Initialization error");
  }
}

initialize();

process.on("SIGTERM", async () => {
  try {
    // await closeKafkaProducer();
    server.close(() => {
      process.exit(0);
    });
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
});

export default server;
