const express = require("express");
const jwt = require("jsonwebtoken");
const { User, Wallet } = require("../models");
const auth = require("../middleware/auth");
const router = express.Router();

// Rejestracja
router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Sprawdzenie czy użytkownik już istnieje
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Użytkownik z tym emailem już istnieje" });
    }

    // Utworzenie użytkownika
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
    });

    // Utworzenie domyślnego portfela PLN
    await Wallet.create({
      userId: user.id,
      currency: "PLN",
      balance: 0.0,
    });

    // Generowanie tokenu
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

    res.status(201).json({
      message: "Użytkownik został zarejestrowany",
      token,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Logowanie
router.post("/login", async (req, res) => {
  try {
    console.log("Otrzymane dane logowania:", req.body);
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    console.log("Znaleziony użytkownik:", user ? "Tak" : "Nie");

    if (!user) {
      console.log("Użytkownik nie znaleziony");
      return res.status(401).json({ error: "Nieprawidłowy email lub hasło" });
    }

    const isValidPassword = await user.comparePassword(password);
    console.log("Czy hasło prawidłowe:", isValidPassword);

    if (!isValidPassword) {
      console.log("Nieprawidłowe hasło");
      return res.status(401).json({ error: "Nieprawidłowy email lub hasło" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    console.log("Token wygenerowany");

    res.json({ token });
  } catch (error) {
    console.error("Błąd logowania:", error);
    res.status(400).json({ error: error.message });
  }
});

// Pobierz dane użytkownika
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.userId },
      attributes: ["email", "firstName", "lastName"],
    });

    if (!user) {
      return res
        .status(404)
        .json({ error: "Użytkownik nie został znaleziony" });
    }

    res.json(user);
  } catch (error) {
    console.error("Błąd pobierania profilu:", error);
    res.status(500).json({ error: error.message });
  }
});

// Edytuj dane użytkownika
router.put("/profile", auth, async (req, res) => {
  try {
    const { firstName, lastName } = req.body;

    const user = await User.findOne({
      where: { id: req.userId },
    });

    if (!user) {
      return res
        .status(404)
        .json({ error: "Użytkownik nie został znaleziony" });
    }

    // Aktualizuj tylko dozwolone pola
    user.firstName = firstName;
    user.lastName = lastName;
    await user.save();

    res.json({
      message: "Profil zaktualizowany",
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("Błąd aktualizacji profilu:", error);
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
