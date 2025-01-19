const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const Wallet = sequelize.define("Wallet", {
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
  currency: {
    type: DataTypes.ENUM("PLN", "EUR", "USD", "GBP", "JPY", "CHF"),
    allowNull: false,
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.0,
  },
});

module.exports = Wallet;
