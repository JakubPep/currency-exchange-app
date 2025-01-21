const express = require("express");
const { Transaction } = require("../models");
const auth = require("../middleware/auth");
const router = express.Router();

// Pobranie wszystkich transakcji użytkownika
router.get("/", auth, async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { userId: req.userId },
      order: [["createdAt", "DESC"]], // Najnowsze pierwsze
    });
    res.json(transactions);
  } catch (error) {
    console.error("Błąd pobierania transakcji:", error);
    res.status(500).json({ error: error.message });
  }
});

// Pobranie szczegółów pojedynczej transakcji
router.get("/:id", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!transaction) {
      return res
        .status(404)
        .json({ error: "Transakcja nie została znaleziona" });
    }

    res.json(transaction);
  } catch (error) {
    console.error("Błąd pobierania transakcji:", error);
    res.status(500).json({ error: error.message });
  }
});

// Filtrowanie transakcji
router.post("/filter", auth, async (req, res) => {
  try {
    const { type, startDate, endDate, currency } = req.body;
    let whereClause = { userId: req.userId };

    if (type) {
      whereClause.type = type;
    }

    if (currency) {
      whereClause = {
        ...whereClause,
        [Op.or]: [{ fromCurrency: currency }, { toCurrency: currency }],
      };
    }

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const transactions = await Transaction.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    res.json(transactions);
  } catch (error) {
    console.error("Błąd filtrowania transakcji:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
