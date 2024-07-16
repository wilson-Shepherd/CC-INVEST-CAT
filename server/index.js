import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/database.js";
import tickerRoutes, { initWebSocketRoutes } from "./routes/ticker.js";
import userRoutes from "./routes/user.js";
import spotTradingRoutes from "./routes/spotTrading.js";
import futuresTradingRoutes from "./routes/futuresTrading.js";
import adminRoutes from "./routes/admin.js";
import { errorHandler } from "./utils/errorHandler.js";
import dcClient from "./services/discordBot/app.js";
import "./utils/orderScheduler.js";
import { initKafkaProducer, closeKafkaProducer } from './services/kafkaService.js';
import { initPriceNotificationScheduler } from './services/discordBot/kafkaProducer.js';

const app = express();
const PORT = process.env.PORT || 3000;
const server = initWebSocketRoutes(app);

connectDB();

async function initialize() {
  try {
    await initKafkaProducer();
    initPriceNotificationScheduler();

    app.use(
      cors({
        origin: "https://app.cc-invest-cat.com",
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

    if (dcClient) {
      console.log("Discord client initialized");
    }

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

initialize();

process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  try {
    await closeKafkaProducer();
    server.close(() => {
      console.log('Server and Kafka producer closed.');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});
