import { useState, useEffect } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { View, Text, useThemeColor } from "../../components/Themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

type Rate = {
  currency: string;
  code: string;
  mid: number;
};

type Wallet = {
  currency: string;
  balance: string;
};

export default function ExchangeScreen() {
  const colors = useThemeColor();
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("PLN");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [rates, setRates] = useState<Rate[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [showFromModal, setShowFromModal] = useState(false);
  const [showToModal, setShowToModal] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (amount) {
      calculateConversion();
    } else {
      setConvertedAmount(null);
    }
  }, [amount, fromCurrency, toCurrency, rates]);

  const fetchInitialData = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      // Pobierz kursy walut
      const ratesResponse = await fetch(
        "http://192.168.33.8:3000/api/exchange/rates",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const ratesData = await ratesResponse.json();
      setRates(ratesData);

      // Pobierz portfele
      const walletsResponse = await fetch(
        "http://192.168.33.8:3000/api/wallet",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const walletsData = await walletsResponse.json();
      setWallets(walletsData);
    } catch (error) {
      console.error("Błąd pobierania danych:", error);
    }
  };

  const calculateConversion = () => {
    const fromRate =
      fromCurrency === "PLN"
        ? 1
        : rates.find((r) => r.code === fromCurrency)?.mid;
    const toRate =
      toCurrency === "PLN" ? 1 : rates.find((r) => r.code === toCurrency)?.mid;

    if (fromRate && toRate && amount) {
      const amountNum = parseFloat(amount);
      if (!isNaN(amountNum)) {
        let converted;
        // Jeśli wymieniamy z PLN
        if (fromCurrency === "PLN") {
          converted = amountNum / toRate;
        }
        // Jeśli wymieniamy na PLN
        else if (toCurrency === "PLN") {
          converted = amountNum * fromRate;
        }
        // Wymiana między walutami obcymi
        else {
          const amountInPLN = amountNum * fromRate;
          converted = amountInPLN / toRate;
        }
        setConvertedAmount(converted);
      }
    }
  };

  const handleExchange = async () => {
    if (!amount || !fromCurrency || !toCurrency) {
      Alert.alert("Błąd", "Wypełnij wszystkie pola");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(
        "http://192.168.33.8:3000/api/exchange/exchange",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fromCurrency,
            toCurrency,
            amount: Number(amount),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Sukces", "Wymiana została zrealizowana", [
          {
            text: "OK",
            onPress: () => {
              router.push("/(tabs)/dashboard");
            },
          },
        ]);
      } else {
        Alert.alert("Błąd", data.error || "Nie udało się wykonać wymiany");
      }
    } catch (error) {
      Alert.alert("Błąd", "Wystąpił problem z wymianą walut");
    }
  };

  const availableCurrencies = ["PLN", ...rates.map((rate) => rate.code)];

  const CurrencySelector = ({
    visible,
    onClose,
    onSelect,
    currentValue,
  }: {
    visible: boolean;
    onClose: () => void;
    onSelect: (currency: string) => void;
    currentValue: string;
  }) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={[styles.modalContainer, { backgroundColor: "rgba(0,0,0,0.5)" }]}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={styles.modalTitle}>Wybierz walutę</Text>
          <ScrollView>
            {availableCurrencies.map((currency) => (
              <TouchableOpacity
                key={currency}
                style={[
                  styles.currencyOption,
                  currency === currentValue && {
                    backgroundColor: colors.primary,
                  },
                ]}
                onPress={() => {
                  onSelect(currency);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.currencyText,
                    currency === currentValue && { color: "white" },
                  ]}
                >
                  {currency}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Zamknij</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Wymiana walut</Text>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={styles.label}>Wymieniam z:</Text>
          <TouchableOpacity
            style={[
              styles.currencySelector,
              { backgroundColor: colors.background },
            ]}
            onPress={() => setShowFromModal(true)}
          >
            <Text style={{ color: colors.text }}>{fromCurrency}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Kwota:</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={amount}
            onChangeText={setAmount}
            placeholder="Wprowadź kwotę"
            placeholderTextColor={colors.placeholder}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Wymieniam na:</Text>
          <TouchableOpacity
            style={[
              styles.currencySelector,
              { backgroundColor: colors.background },
            ]}
            onPress={() => setShowToModal(true)}
          >
            <Text style={{ color: colors.text }}>{toCurrency}</Text>
          </TouchableOpacity>

          {convertedAmount !== null && (
            <Text style={[styles.conversionResult, { color: colors.primary }]}>
              Otrzymasz: {convertedAmount.toFixed(2)} {toCurrency}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleExchange}
          >
            <Text style={styles.buttonText}>Wymień walutę</Text>
          </TouchableOpacity>
        </View>

        <CurrencySelector
          visible={showFromModal}
          onClose={() => setShowFromModal(false)}
          onSelect={setFromCurrency}
          currentValue={fromCurrency}
        />

        <CurrencySelector
          visible={showToModal}
          onClose={() => setShowToModal(false)}
          onSelect={setToCurrency}
          currentValue={toCurrency}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 16,
    fontSize: 16,
  },
  currencySelector: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 16,
    justifyContent: "center",
    borderColor: "#ddd",
  },
  conversionResult: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    maxHeight: "70%",
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  currencyOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  currencyText: {
    fontSize: 16,
  },
  closeButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
