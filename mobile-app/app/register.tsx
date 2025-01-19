import { useState } from "react";
import { Alert, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { View, Text, useThemeColor } from "../components/Themed";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const colors = useThemeColor();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      Alert.alert("Błąd", "Wypełnij wszystkie pola");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Błąd", "Hasła nie są identyczne");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Błąd", "Hasło musi mieć minimum 6 znaków");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        "http://192.168.33.8:3000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            firstName,
            lastName,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.token) {
        await AsyncStorage.setItem("userToken", data.token);
        router.replace("/(tabs)/dashboard");
      } else {
        Alert.alert("Błąd", data.error || "Nie udało się zarejestrować");
      }
    } catch (error) {
      console.error("Szczegóły błędu:", error);
      Alert.alert(
        "Błąd",
        "Nie udało się zarejestrować. Sprawdź połączenie z internetem."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rejestracja</Text>
      <Text style={[styles.subtitle, { color: colors.placeholder }]}>
        Utwórz nowe konto i wymieniaj waluty
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
        placeholder="Wprowadź swoje imię"
        value={firstName}
        onChangeText={setFirstName}
        autoCapitalize="words"
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
        placeholder="Wprowadź swoje nazwisko"
        value={lastName}
        onChangeText={setLastName}
        autoCapitalize="words"
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
        placeholder="Wprowadź hasło (min. 6 znaków)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
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
        placeholder="Potwierdź hasło"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        placeholderTextColor={colors.placeholder}
      />

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: colors.primary },
          isLoading && styles.buttonDisabled,
        ]}
        onPress={handleRegister}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Tworzenie konta..." : "Utwórz konto"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/login")}
        style={styles.linkButton}
      >
        <Text style={[styles.link, { color: colors.primary }]}>
          Masz już konto? Zaloguj się
        </Text>
      </TouchableOpacity>

      <Text style={[styles.info, { color: colors.placeholder }]}>
        * Wszystkie pola są wymagane{"\n"}* Hasło musi mieć minimum 6 znaków
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  buttonDisabled: {
    opacity: 0.7,
  },
  linkButton: {
    marginTop: 15,
    alignItems: "center",
  },
  link: {
    fontSize: 16,
    textAlign: "center",
  },
  info: {
    marginTop: 20,
    fontSize: 14,
    textAlign: "center",
  },
});
