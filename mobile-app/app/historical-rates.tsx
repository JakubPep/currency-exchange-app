import { useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Alert,
  SafeAreaView,
} from "react-native";
import { View, Text, useThemeColor } from "../components/Themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useRouter } from "expo-router";
import api from "@/services/api";

type HistoricalRate = {
  currency: string;
  code: string;
  mid: number;
  effectiveDate: string;
};

export default function HistoricalRatesScreen() {
  const [selectedCurrency, setSelectedCurrency] = useState("EUR");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rates, setRates] = useState<HistoricalRate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const colors = useThemeColor();
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const router = useRouter();

  const fetchHistoricalRates = async () => {
    try {
      setIsLoading(true);

      if (!startDate || !endDate) {
        Alert.alert("Błąd", "Wprowadź daty rozpoczęcia i zakończenia");
        return;
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        Alert.alert(
          "Błąd",
          "Nieprawidłowy format daty. Użyj formatu RRRR-MM-DD"
        );
        return;
      }

      const response = await api.get(
        `/exchange/rates/${selectedCurrency}/historical?startDate=${startDate}&endDate=${endDate}`
      );

      if (response.status === 200) {
        setRates(response.data);
      } else {
        Alert.alert("Błąd", "Nie udało się pobrać danych historycznych");
      }
    } catch (error) {
      console.error("Szczegóły błędu:", error);
      Alert.alert(
        "Błąd",
        "Wystąpił problem z pobieraniem danych historycznych"
      );
    } finally {
      setIsLoading(false);
    }
  };

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
  }) => {
    const colors = useThemeColor();
    const currencies = ["EUR", "USD", "GBP", "CHF", "JPY"];

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: "rgba(0,0,0,0.5)" },
          ]}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={styles.modalTitle}>Wybierz walutę</Text>
            <ScrollView>
              {currencies.map((currency) => (
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
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={[styles.backButtonText, { color: colors.primary }]}>
              ← Powrót
            </Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Historia kursów walut</Text>
          </View>
        </View>

        <View style={styles.filters}>
          <TouchableOpacity
            style={[
              styles.currencySelector,
              { backgroundColor: colors.background },
            ]}
            onPress={() => setShowCurrencyModal(true)}
          >
            <Text style={{ color: colors.text }}>{selectedCurrency}</Text>
          </TouchableOpacity>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="Data od (RRRR-MM-DD)"
            placeholderTextColor={colors.placeholder}
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={endDate}
            onChangeText={setEndDate}
            placeholder="Data do (RRRR-MM-DD)"
            placeholderTextColor={colors.placeholder}
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={fetchHistoricalRates}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Ładowanie..." : "Pokaż kursy"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.ratesList}>
          {rates.map((rate, index) => (
            <View
              key={index}
              style={[styles.rateItem, { backgroundColor: colors.card }]}
            >
              <Text style={styles.date}>{rate.effectiveDate}</Text>
              <Text style={[styles.rate, { color: colors.primary }]}>
                1 {selectedCurrency} = {rate.mid.toFixed(4)} PLN
              </Text>
            </View>
          ))}
        </ScrollView>

        <CurrencySelector
          visible={showCurrencyModal}
          onClose={() => setShowCurrencyModal(false)}
          onSelect={setSelectedCurrency}
          currentValue={selectedCurrency}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  filters: {
    gap: 12,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  ratesList: {
    flex: 1,
  },
  rateItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    marginBottom: 4,
  },
  rate: {
    fontSize: 16,
    fontWeight: "bold",
  },
  currencySelector: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    justifyContent: "center",
    borderColor: "#ddd",
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  backButton: {
    padding: 8,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    marginLeft: -44,
  },
});
