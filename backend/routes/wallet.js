const express = require("express");
const { Wallet, Transaction } = require("../models");
const auth = require("../middleware/auth");
const router = express.Router();

// Pobranie stanu portfela
router.get("/", auth, async (req, res) => {
  try {
    const wallets = await Wallet.findAll({
      where: { userId: req.userId },
    });
    res.json(wallets);
  } catch (error) {
    console.error("Błąd pobierania portfeli:", error);
    res.status(400).json({ error: error.message });
  }
});

// Zasilenie portfela
router.post("/deposit", auth, async (req, res) => {
  try {
    const { currency, amount } = req.body;

    const wallet = await Wallet.findOne({
      where: {
        userId: req.userId,
        currency,
      },
    });

    if (!wallet) {
      // Jeśli portfel nie istnieje, utworz nowy
      await Wallet.create({
        userId: req.userId,
        currency,
        balance: amount,
      });
    } else {
      // Jeśli portfel istnieje, zaktualizuj saldo
      wallet.balance = Number(wallet.balance) + Number(amount);
      await wallet.save();
    }

    // Zapisz transakcję
    await Transaction.create({
      userId: req.userId,
      type: "DEPOSIT",
      fromCurrency: currency,
      amount,
      status: "COMPLETED",
    });

    res.json({ message: "Portfel został zasilony" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
