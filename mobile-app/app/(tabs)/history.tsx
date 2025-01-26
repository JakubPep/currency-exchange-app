import { useEffect, useState } from "react";
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { View, Text, useThemeColor } from "../../components/Themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/services/api";

type Transaction = {
  id: string;
  type: "DEPOSIT" | "EXCHANGE";
  fromCurrency: string;
  toCurrency?: string;
  amount: number;
  exchangeRate?: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  createdAt: string;
};

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colors = useThemeColor();

  const fetchTransactions = async () => {
    try {
      const response = await api.get("/transactions");
      setTransactions(response.data);
    } catch (error) {
      console.error("Błąd pobierania transakcji:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("pl-PL");
  };

  const getTransactionIcon = (type: Transaction["type"]) => {
    return type === "DEPOSIT" ? "💰" : "🔄";
  };

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "COMPLETED":
        return "#4CAF50";
      case "PENDING":
        return "#FFC107";
      case "FAILED":
        return "#F44336";
      default:
        return colors.text;
    }
  };

  const formatAmount = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return "0.00";
    return Number(amount).toFixed(2);
  };

  const calculateConvertedAmount = (
    amount: number,
    exchangeRate: number,
    fromCurrency: string,
    toCurrency: string
  ) => {
    if (!amount || !exchangeRate) return 0;

    // Obsługa dla JPY
    if (fromCurrency === "JPY" && toCurrency === "PLN") {
      return amount * exchangeRate;
    } else if (fromCurrency === "PLN" && toCurrency === "JPY") {
      return amount / exchangeRate;
    }

    // Standardowe obliczenia dla innych walut
    if (fromCurrency === "PLN") {
      return amount / exchangeRate;
    } else if (toCurrency === "PLN") {
      return amount * exchangeRate;
    } else {
      // Wymiana między walutami obcymi
      const amountInPLN = amount * exchangeRate;
      return amountInPLN;
    }
  };

  const displayExchangeRate = (
    fromCurrency: string,
    toCurrency: string,
    rate: number | undefined
  ) => {
    if (!rate) return `Kurs niedostępny`;

    // Jeśli wymieniamy z PLN na inną walutę, pokazujemy odwrócony kurs
    if (fromCurrency === "PLN") {
      return `1 ${fromCurrency} = ${(1 / Number(rate)).toFixed(
        6
      )} ${toCurrency}`;
    }
    // Jeśli wymieniamy na PLN lub między walutami obcymi, pokazujemy normalny kurs
    return `1 ${fromCurrency} = ${Number(rate).toFixed(6)} ${toCurrency}`;
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={[styles.transactionCard, { backgroundColor: colors.card }]}>
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionIcon}>
          {getTransactionIcon(item.type)}
        </Text>
        <View style={styles.transactionType}>
          <Text style={styles.transactionTypeText}>
            {item.type === "DEPOSIT" ? "Wpłata" : "Wymiana"}
          </Text>
          <Text
            style={[
              styles.transactionStatus,
              { color: getStatusColor(item.status) },
            ]}
          >
            {item.status === "COMPLETED"
              ? "Zakończona"
              : item.status === "PENDING"
              ? "W trakcie"
              : "Błąd"}
          </Text>
        </View>
        <Text style={styles.transactionDate}>{formatDate(item.createdAt)}</Text>
      </View>

      <View style={styles.transactionDetails}>
        {item.type === "EXCHANGE" ? (
          <>
            <Text style={styles.transactionAmount}>
              -{formatAmount(item.amount)} {item.fromCurrency}
            </Text>
            <Text style={styles.exchangeArrow}>➜</Text>
            <Text style={styles.transactionAmount}>
              +
              {formatAmount(
                calculateConvertedAmount(
                  item.amount,
                  item.exchangeRate || 0,
                  item.fromCurrency,
                  item.toCurrency || ""
                )
              )}{" "}
              {item.toCurrency}
            </Text>
          </>
        ) : (
          <Text style={styles.transactionAmount}>
            +{formatAmount(item.amount)} {item.fromCurrency}
          </Text>
        )}
      </View>

      {item.exchangeRate && item.type === "EXCHANGE" && (
        <Text style={[styles.exchangeRate, { color: colors.placeholder }]}>
          {displayExchangeRate(
            item.fromCurrency,
            item.toCurrency || "",
            item.exchangeRate
          )}
        </Text>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Ładowanie transakcji...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.text}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Brak transakcji do wyświetlenia
              </Text>
            </View>
          }
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
  transactionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  transactionIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  transactionType: {
    flex: 1,
  },
  transactionTypeText: {
    fontSize: 16,
    fontWeight: "600",
  },
  transactionStatus: {
    fontSize: 12,
  },
  transactionDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  transactionDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  exchangeArrow: {
    fontSize: 20,
    marginHorizontal: 8,
  },
  exchangeRate: {
    fontSize: 12,
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    opacity: 0.7,
  },
});
