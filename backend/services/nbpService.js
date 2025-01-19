const axios = require("axios");

const NBP_API_BASE_URL = "http://api.nbp.pl/api/exchangerates";

class NBPService {
  // Pobieranie aktualnej tabeli kursów (domyślnie tabela A)
  static async getCurrentExchangeRates(table = "A") {
    try {
      const response = await axios.get(
        `${NBP_API_BASE_URL}/tables/${table}/?format=json`
      );
      const rates = response.data[0].rates;

      // Filtrujemy tylko interesujące nas waluty
      const supportedCurrencies = ["EUR", "USD", "GBP", "CHF", "JPY"];
      return rates.filter((rate) => supportedCurrencies.includes(rate.code));
    } catch (error) {
      throw new Error("Nie udało się pobrać kursów walut");
    }
  }

  // Pobieranie kursu pojedynczej waluty
  static async getCurrentRate(code, table = "A") {
    try {
      const response = await axios.get(
        `${NBP_API_BASE_URL}/rates/${table}/${code}/?format=json`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Nie udało się pobrać kursu waluty ${code}`);
    }
  }

  // Pobieranie historycznych kursów pojedynczej waluty
  static async getHistoricalRates(code, startDate, endDate, table = "A") {
    try {
      const response = await axios.get(
        `${NBP_API_BASE_URL}/rates/${table}/${code}/${startDate}/${endDate}/?format=json`
      );
      return response.data;
    } catch (error) {
      throw new Error("Nie udało się pobrać historycznych kursów walut");
    }
  }

  // Pobieranie ostatnich N kursów dla waluty
  static async getLastRates(code, topCount = 10, table = "A") {
    try {
      const response = await axios.get(
        `${NBP_API_BASE_URL}/rates/${table}/${code}/last/${topCount}/?format=json`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Nie udało się pobrać ostatnich ${topCount} kursów`);
    }
  }

  // Pobieranie kursu z konkretnego dnia
  static async getRateByDate(code, date, table = "A") {
    try {
      const response = await axios.get(
        `${NBP_API_BASE_URL}/rates/${table}/${code}/${date}/?format=json`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Nie udało się pobrać kursu z dnia ${date}`);
    }
  }
}

module.exports = NBPService;
