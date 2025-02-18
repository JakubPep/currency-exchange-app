import {
  Alert,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { View, Text, useThemeColor } from "../components/Themed";
import { useRouter } from "expo-router";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/services/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const colors = useThemeColor();

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      console.log("Dane do logowania:", { email, password });

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("Status odpowiedzi:", response.status);
      console.log("Odpowiedź serwera:", response.data);

      if (response.status === 200 && response.data.token) {
        await AsyncStorage.setItem("userToken", response.data.token);
        router.replace("/(tabs)/dashboard");
      } else {
        Alert.alert(
          "Błąd",
          response.data.error || "Nieprawidłowe dane logowania"
        );
      }
    } catch (error) {
      console.error("Szczegóły błędu:", error);
      Alert.alert(
        "Błąd",
        "Nie udało się zalogować. Sprawdź połączenie z internetem."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Logowanie</Text>
        <Text style={[styles.subtitle, { color: colors.placeholder }]}>
          Wprowadź dane, aby się zalogować
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="Wprowadź swój email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={colors.placeholder}
        />

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="Wprowadź swoje hasło"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={colors.placeholder}
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Zaloguj się</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/register")}
          style={styles.linkButton}
        >
          <Text style={[styles.link, { color: colors.primary }]}>
            Nie masz konta? Zarejestruj się
          </Text>
        </TouchableOpacity>
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
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkButton: {
    marginTop: 15,
    alignItems: "center",
  },
  link: {
    fontSize: 16,
    textAlign: "center",
  },
});
