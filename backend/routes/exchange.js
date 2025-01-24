const express = require("express");
const { Transaction, Wallet } = require("../models");
const NBPService = require("../services/nbpService");
const auth = require("../middleware/auth");
const router = express.Router();
const sequelize = require("../config/config");

// Logowanie wszystkich przychodzących requestów
router.use((req, res, next) => {
  console.log("Exchange route request:", {
    method: req.method,
    path: req.path,
    params: req.params,
    query: req.query,
  });
  next();
});

router.get("/rates/:code/historical", auth, async (req, res) => {
  console.log("Historical rates params:", req.params);
  try {
    const { code } = req.params;
    const { startDate, endDate } = req.query;

    console.log("Fetching historical rates for:", { code, startDate, endDate });

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Wymagane parametry: startDate i endDate" });
    }

    const rates = await NBPService.getHistoricalRates(code, startDate, endDate);
    res.json(rates);
  } catch (error) {
    console.error("Błąd pobierania historycznych kursów:", error);
    res
      .status(500)
      .json({ error: "Nie udało się pobrać historycznych kursów" });
  }
});

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
  const transaction = await sequelize.transaction();

  try {
    const { fromCurrency, toCurrency, amount } = req.body;

    // Sprawdź dostępność środków w źródłowym portfelu
    const sourceWallet = await Wallet.findOne({
      where: {
        userId: req.userId,
        currency: fromCurrency,
      },
      transaction,
    });

    if (!sourceWallet || sourceWallet.balance < amount) {
      await transaction.rollback();
      return res.status(400).json({ error: "Niewystarczające środki" });
    }

    // Znajdź lub utwórz portfel docelowy
    let targetWallet = await Wallet.findOne({
      where: {
        userId: req.userId,
        currency: toCurrency,
      },
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

    // Pobierz kursy
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

    // Oblicz kwotę po przewalutowaniu
    let convertedAmount;
    let savedExchangeRate;

    if (fromCurrency === "PLN") {
      convertedAmount = amount / toRate;
      savedExchangeRate = toRate;
    } else if (toCurrency === "PLN") {
      convertedAmount = amount * fromRate;
      savedExchangeRate = fromRate;
    } else {
      const amountInPLN = amount * fromRate;
      convertedAmount = amountInPLN / toRate;
      savedExchangeRate = fromRate / toRate;
    }

    // Aktualizuj portfele
    sourceWallet.balance = Number(sourceWallet.balance) - Number(amount);
    await sourceWallet.save({ transaction });

    targetWallet.balance =
      Number(targetWallet.balance) + Number(convertedAmount);
    await targetWallet.save({ transaction });

    // Zapisz transakcję w historii
    await Transaction.create(
      {
        userId: req.userId,
        type: "EXCHANGE",
        fromCurrency,
        toCurrency,
        amount,
        exchangeRate: savedExchangeRate,
        status: "COMPLETED",
      },
      { transaction }
    );

    // Zatwierdź transakcję
    await transaction.commit();

    res.json({
      message: "Wymiana została zrealizowana",
      convertedAmount,
      exchangeRate: toRate / fromRate,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Błąd wymiany walut:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
