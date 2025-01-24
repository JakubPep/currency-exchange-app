import { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
} from "react-native";
import { View, Text, useThemeColor } from "../../components/Themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TouchableWithoutFeedback } from "react-native";
import { Keyboard } from "react-native";
import { router, useFocusEffect } from "expo-router";

type Wallet = {
  id: string;
  userId: string;
  currency: string;
  balance: string;
  createdAt: string;
  updatedAt: string;
};

type Rate = {
  currency: string;
  code: string;
  mid: number;
};

type DepositModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (amount: string) => void;
  currency: string;
};

const DepositModal = ({
  visible,
  onClose,
  onSubmit,
  currency,
}: DepositModalProps) => {
  const [amount, setAmount] = useState("");
  const colors = useThemeColor();

  const handleSubmit = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert("Błąd", "Wprowadź prawidłową kwotę");
      return;
    }
    onSubmit(amount);
    setAmount("");
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}
        >
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              style={[styles.modalContent, { backgroundColor: colors.card }]}
            >
              <Text style={styles.modalTitle}>Wpłata środków</Text>
              <Text
                style={[styles.modalSubtitle, { color: colors.placeholder }]}
              >
                Waluta: {currency}
              </Text>

              <TextInput
                style={[
                  styles.modalInput,
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
                autoFocus
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.buttonText}>Wpłać</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: colors.border },
                  ]}
                  onPress={onClose}
                >
                  <Text style={styles.buttonText}>Anuluj</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default function DashboardScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [rates, setRates] = useState<Rate[]>([]);
  const colors = useThemeColor();
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [isDepositModalVisible, setIsDepositModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      const walletsResponse = await fetch(
        "http://192.168.33.8:3000/api/wallet",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const ratesResponse = await fetch(
        "http://192.168.33.8:3000/api/exchange/rates",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const walletsData = await walletsResponse.json();
      const sortedWallets = walletsData.sort((a: Wallet, b: Wallet) =>
        a.currency.localeCompare(b.currency)
      );
      setWallets(sortedWallets);
      const ratesData = await ratesResponse.json();

      setWallets(walletsData);
      setRates(ratesData);
      setIsLoading(false);
    } catch (error) {
      console.error("Błąd:", error);
      setIsLoading(false);
    }
  };

  const handleDeposit = async (amount: string) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(
        "http://192.168.33.8:3000/api/wallet/deposit",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currency: selectedCurrency,
            amount: Number(amount),
          }),
        }
      );

      if (response.ok) {
        Alert.alert("Sukces", "Środki zostały wpłacone");
        fetchData(); // Odświeżamy dane
      } else {
        const data = await response.json();
        Alert.alert("Błąd", data.error || "Nie udało się wpłacić środków");
      }
    } catch (error) {
      Alert.alert("Błąd", "Wystąpił problem z wpłatą środków");
    } finally {
      setIsDepositModalVisible(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderWallet = (wallet: Wallet) => (
    <View
      key={wallet.id}
      style={[styles.walletCard, { backgroundColor: colors.primary }]}
    >
      <View style={styles.walletHeader}>
        <Text style={styles.walletCurrency}>{wallet.currency}</Text>
        <TouchableOpacity
          onPress={() => {
            setSelectedCurrency(wallet.currency);
            setIsDepositModalVisible(true);
          }}
        >
          <Text style={styles.depositButton}>+</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.walletAmount}>
        {parseFloat(wallet.balance).toFixed(2)}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={[styles.container, { backgroundColor: colors.background }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={styles.sectionTitle}>Twoje środki</Text>
            <View style={styles.walletsContainer}>
              {wallets.map((wallet) => (
                <View
                  key={wallet.id}
                  style={[
                    styles.walletCard,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <View style={styles.walletHeader}>
                    <Text style={styles.walletCurrency}>{wallet.currency}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedCurrency(wallet.currency);
                        setIsDepositModalVisible(true);
                      }}
                    >
                      <Text style={styles.depositButton}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.walletAmount}>
                    {parseFloat(wallet.balance).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Aktualne kursy walut</Text>
              <TouchableOpacity
                onPress={() => router.push("/historical-rates")}
                style={styles.historicalButton}
              >
                <Text
                  style={[
                    styles.historicalButtonText,
                    { color: colors.primary },
                  ]}
                >
                  Historia kursów
                </Text>
              </TouchableOpacity>
            </View>
            {rates.map((rate) => (
              <View
                key={rate.code}
                style={[styles.rateRow, { borderBottomColor: colors.border }]}
              >
                <Text style={styles.rateCode}>{rate.code}</Text>
                <Text style={styles.rateName}>{rate.currency}</Text>
                <Text style={[styles.rateValue, { color: colors.primary }]}>
                  {rate.mid.toFixed(4)} PLN
                </Text>
              </View>
            ))}
          </View>

          <DepositModal
            visible={isDepositModalVisible}
            onClose={() => setIsDepositModalVisible(false)}
            onSubmit={handleDeposit}
            currency={selectedCurrency}
          />
        </ScrollView>
      </TouchableWithoutFeedback>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  walletsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  walletsContainer: {
    width: "100%",
    gap: 12,
  },
  walletCard: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    minWidth: 150,
  },
  walletAmount: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  walletCurrency: {
    color: "white",
    fontSize: 16,
  },
  rateRow: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  rateCode: {
    width: 50,
    fontWeight: "bold",
  },
  rateName: {
    flex: 1,
    marginLeft: 12,
  },
  rateValue: {
    fontWeight: "bold",
  },
  walletHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "transparent",
  },
  depositButton: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalInput: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  historicalButton: {
    padding: 8,
  },
  historicalButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
