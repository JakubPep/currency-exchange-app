const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Połączenie z bazą danych PostgreSQL zostało ustanowione.");
  } catch (error) {
    console.error("Nie można połączyć się z bazą danych:", error);
    console.error("Szczegóły błędu:", error.message);
  }
};

testConnection();

module.exports = sequelize;
