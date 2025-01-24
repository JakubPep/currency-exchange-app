const express = require("express");
const cors = require("cors");
require("dotenv").config();
const sequelize = require("./config/config");

// Import routes
const authRoutes = require("./routes/auth");
const walletRoutes = require("./routes/wallet");
const exchangeRoutes = require("./routes/exchange");
const transactionRoutes = require("./routes/transactions");

const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/exchange", exchangeRoutes);
app.use("/api/transactions", transactionRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
