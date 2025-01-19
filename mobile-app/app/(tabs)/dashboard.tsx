import { useEffect, useState } from "react";
import { StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { View, Text, useThemeColor } from "../../components/Themed";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Typy zostają bez zmian
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

export default function DashboardScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [rates, setRates] = useState<Rate[]>([]);
  const colors = useThemeColor();

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
      const ratesData = await ratesResponse.json();

      setWallets(walletsData);
      setRates(ratesData);
      setIsLoading(false);
    } catch (error) {
      console.error("Błąd:", error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={styles.sectionTitle}>Twoje środki</Text>
        <View style={styles.walletsGrid}>
          {wallets.map((wallet) => (
            <View key={wallet.id} style={styles.walletCard}>
              <Text style={styles.walletAmount}>
                {parseFloat(wallet.balance).toFixed(2)}
              </Text>
              <Text style={styles.walletCurrency}>{wallet.currency}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={styles.sectionTitle}>Aktualne kursy walut</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
});
