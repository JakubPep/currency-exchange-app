const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const Transaction = sequelize.define(
  "Transaction",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    type: {
      type: DataTypes.ENUM("DEPOSIT", "WITHDRAWAL", "EXCHANGE"),
      allowNull: false,
    },
    fromCurrency: {
      type: DataTypes.ENUM("PLN", "EUR", "USD", "GBP", "JPY", "CHF"),
      allowNull: false,
    },
    toCurrency: {
      type: DataTypes.ENUM("PLN", "EUR", "USD", "GBP", "JPY", "CHF"),
      allowNull: true, // null dla wpłat/wypłat
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    exchangeRate: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true, // null dla wpłat/wypłat
    },
    status: {
      type: DataTypes.ENUM("PENDING", "COMPLETED", "FAILED"),
      defaultValue: "PENDING",
    },
  },
  {
    timestamps: true, // automatycznie dodaje createdAt i updatedAt
  }
);

module.exports = Transaction;
