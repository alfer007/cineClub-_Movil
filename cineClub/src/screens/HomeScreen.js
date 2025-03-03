import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";

export default function HomeScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar si hay una sesión guardada al iniciar la app
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const storedUID = await AsyncStorage.getItem("userUID");
        if (storedUID) {
          navigation.replace("Dashboard"); // Si hay sesión, ir a Dashboard directamente
        }
      } catch (error) {
        console.error("Error al verificar sesión:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, []);

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      Alert.alert("Inicio de sesión exitoso");

      if (rememberMe) {
        await AsyncStorage.setItem("userUID", user.uid); // Guardar UID del usuario
      }

      navigation.replace("Dashboard"); // Navega a la pantalla principal
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem("userUID"); // Eliminar la sesión guardada
      Alert.alert("Sesión cerrada");
      navigation.replace("Home");
    } catch (error) {
      Alert.alert("Error al cerrar sesión", error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Checkbox manual */}
      <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
        <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]} />
        <Text style={styles.checkboxLabel}>Mantener sesión iniciada</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button2} onPress={() => navigation.navigate("Register")}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Ingresar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { width: "100%", padding: 10, borderBottomWidth: 1, marginBottom: 20 },
  checkboxContainer: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#000",
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: "green", // Color cuando está marcado
  },
  checkboxLabel: { fontSize: 16 },
  button: { backgroundColor: "blue", padding: 10, borderRadius: 5, width: "100%", alignItems: "center", marginTop: 10 },
  button2: { backgroundColor: "black", padding: 10, borderRadius: 5, width: "100%", alignItems: "center" },
  logoutButton: { backgroundColor: "red", padding: 10, borderRadius: 5, width: "100%", alignItems: "center", marginTop: 10 },
  buttonText: { color: "white", fontSize: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" }
});
