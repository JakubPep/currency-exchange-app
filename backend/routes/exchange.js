const express = require("express");
const { Transaction, Wallet } = require("../models");
const NBPService = require("../services/nbpService");
const auth = require("../middleware/auth");
const router = express.Router();
const sequelize = require("../config/config");

router.get("/rates", auth, async (req, res) => {
  try {
    console.log("Próba pobrania kursów walut");
    const rates = await NBPService.getCurrentExchangeRates();
    console.log("Pobrane kursy:", rates);
    res.json(rates);
  } catch (error) {
    console.error("Szczegóły błędu:", error);
    res.status(400).json({ error: error.message });
  }
});

router.post("/exchange", auth, async (req, res) => {
  const { fromCurrency, toCurrency, amount } = req.body;

  // Rozpocznij transakcję bazodanową
  const transaction = await sequelize.transaction();

  try {
    // Sprawdź dostępność środków
    const sourceWallet = await Wallet.findOne({
      where: { userId: req.userId, currency: fromCurrency },
      transaction,
    });

    if (!sourceWallet || sourceWallet.balance < amount) {
      await transaction.rollback();
      return res.status(400).json({ error: "Niewystarczające środki" });
    }

    // Pobierz aktualne kursy
    const rates = await NBPService.getCurrentExchangeRates();
    const fromRate =
      fromCurrency === "PLN"
        ? 1
        : rates.find((r) => r.code === fromCurrency)?.mid;
    const toRate =
      toCurrency === "PLN" ? 1 : rates.find((r) => r.code === toCurrency)?.mid;

    if (!fromRate || !toRate) {
      await transaction.rollback();
      return res.status(400).json({ error: "Nieprawidłowa waluta" });
    }

    // Oblicz kwotę wymienioną
    const exchangeRate = toRate / fromRate;
    const convertedAmount = amount * exchangeRate;

    // Odejmij z pierwszego portfela
    sourceWallet.balance -= Number(amount);
    await sourceWallet.save({ transaction });

    // Dodaj do drugiego portfela
    let targetWallet = await Wallet.findOne({
      where: { userId: req.userId, currency: toCurrency },
      transaction,
    });

    if (!targetWallet) {
      targetWallet = await Wallet.create(
        {
          userId: req.userId,
          currency: toCurrency,
          balance: 0,
        },
        { transaction }
      );
    }

    targetWallet.balance = Number(targetWallet.balance) + convertedAmount;
    await targetWallet.save({ transaction });

    // Zapisz transakcję
    await Transaction.create(
      {
        userId: req.userId,
        type: "EXCHANGE",
        fromCurrency,
        toCurrency,
        amount,
        exchangeRate,
        status: "COMPLETED",
      },
      { transaction }
    );

    // Zatwierdź transakcję bazodanową
    await transaction.commit();

    res.json({
      message: "Wymiana została zrealizowana",
      convertedAmount,
      exchangeRate,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Błąd wymiany walut:", error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
