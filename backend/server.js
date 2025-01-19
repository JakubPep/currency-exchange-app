const express = require("express");
const cors = require("cors");
require("dotenv").config();
const sequelize = require("./config/config");

// Import routes
const authRoutes = require("./routes/auth");
const walletRoutes = require("./routes/wallet");
const exchangeRoutes = require("./routes/exchange");

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

// Test endpoint
app.get("/test", (req, res) => {
  res.json({ message: "Backend działa prawidłowo!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
