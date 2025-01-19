const User = require("./user");
const Wallet = require("./wallet");
const Transaction = require("./transaction");

// Definiowanie relacji
User.hasMany(Wallet, { foreignKey: "userId" });
Wallet.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Transaction, { foreignKey: "userId" });
Transaction.belongsTo(User, { foreignKey: "userId" });

module.exports = {
  User,
  Wallet,
  Transaction,
};
