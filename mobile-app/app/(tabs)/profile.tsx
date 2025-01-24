import { useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { View, Text, useThemeColor } from "../../components/Themed";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

type UserProfile = {
  email: string;
  firstName: string;
  lastName: string;
};

type EditModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (firstName: string, lastName: string) => void;
  currentData: UserProfile | null;
};

const EditProfileModal = ({
  visible,
  onClose,
  onSave,
  currentData,
}: EditModalProps) => {
  const colors = useThemeColor();
  const [firstName, setFirstName] = useState(currentData?.firstName || "");
  const [lastName, setLastName] = useState(currentData?.lastName || "");

  useEffect(() => {
    if (currentData) {
      setFirstName(currentData.firstName);
      setLastName(currentData.lastName);
    }
  }, [currentData]);

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Błąd", "Wszystkie pola muszą być wypełnione");
      return;
    }
    onSave(firstName, lastName);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={styles.modalTitle}>Edytuj profil</Text>

          <Text style={styles.label}>Imię</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Wprowadź imię"
            placeholderTextColor={colors.placeholder}
          />

          <Text style={styles.label}>Nazwisko</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Wprowadź nazwisko"
            placeholderTextColor={colors.placeholder}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Zapisz</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.border }]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Anuluj</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function ProfileScreen() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const colors = useThemeColor();

  const handleLogout = async () => {
    Alert.alert("Wylogowanie", "Czy na pewno chcesz się wylogować?", [
      {
        text: "Anuluj",
        style: "cancel",
      },
      {
        text: "Wyloguj",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("userToken");
          router.replace("/login");
        },
      },
    ]);
  };

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(
        "http://192.168.33.8:3000/api/auth/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setUser(data);
      } else {
        Alert.alert(
          "Błąd",
          data.error || "Nie udało się pobrać danych profilu"
        );
      }
    } catch (error) {
      console.error("Błąd:", error);
      Alert.alert("Błąd", "Problem z połączeniem");
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleUpdateProfile = async (firstName: string, lastName: string) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(
        "http://192.168.33.8:3000/api/auth/profile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ firstName, lastName }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setIsEditModalVisible(false);
        Alert.alert("Sukces", "Profil został zaktualizowany");
      } else {
        Alert.alert(
          "Błąd",
          data.error || "Nie udało się zaktualizować profilu"
        );
      }
    } catch (error) {
      console.error("Błąd:", error);
      Alert.alert("Błąd", "Problem z połączeniem");
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={styles.title}>Profil użytkownika</Text>

        <View style={styles.profileInfo}>
          <Text style={styles.label}>Email</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {user?.email || "Ładowanie..."}
          </Text>

          <Text style={styles.label}>Imię</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {user?.firstName || "Ładowanie..."}
          </Text>

          <Text style={styles.label}>Nazwisko</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {user?.lastName || "Ładowanie..."}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => setIsEditModalVisible(true)}
        >
          <Text style={styles.buttonText}>Edytuj profil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: "#ff3b30" }]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Wyloguj się</Text>
        </TouchableOpacity>
      </View>
      <EditProfileModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onSave={handleUpdateProfile}
        currentData={user}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  profileInfo: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.7,
  },
  value: {
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  logoutButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
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
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
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
});
