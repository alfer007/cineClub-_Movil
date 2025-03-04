import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Text,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import LottieView from "lottie-react-native";
import { doc, getDoc } from "firebase/firestore";

export default function HomeScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [showAnimation, setShowAnimation] = useState(false);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userName, setUserName] = useState("");

  // Animaciones
  const backgroundFade = useRef(new Animated.Value(0)).current;
  const logoFade = useRef(new Animated.Value(0)).current;
  const logoMovement = useRef(new Animated.Value(0)).current;
  const loginFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animaciones
    Animated.timing(backgroundFade, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    Animated.timing(logoFade, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(logoMovement, {
        toValue: -220,
        duration: 2000,
        easing: Easing.inOut(Easing.exp),
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(loginFade, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      });
    }, 2250);

    // Verificación de sesión
    const checkUserSession = async () => {
      try {
        const storedUID = await AsyncStorage.getItem("userUID");
        if (storedUID) {
          navigation.replace("Dashboard");
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
   setIsLoggingIn(true); // Muestra la animación
 
   try {
     const userCredential = await signInWithEmailAndPassword(auth, email, password);
     const user = userCredential.user;
 
     if (rememberMe) {
       await AsyncStorage.setItem("userUID", user.uid);
     }
 
     // Obtener datos del usuario desde Firestore
     const userDocRef = doc(db, "usuarios", user.uid);
     const userDocSnap = await getDoc(userDocRef);
 
     if (userDocSnap.exists()) {
       const userData = userDocSnap.data();
       setUserName(userData.nombre || "Usuario"); // Si no tiene nombre, muestra "Usuario"
     }
 
     // Espera 2 segundos antes de navegar
     setTimeout(() => {
       setIsLoggingIn(false);
       navigation.replace("Dashboard");
     }, 2000);
   } catch (error) {
     setIsLoggingIn(false);
     Alert.alert("Error", error.message);
   }
 };
 

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem("userUID");
      Alert.alert("Sesión cerrada");
      navigation.replace("Home");
    } catch (error) {
      Alert.alert("Error al cerrar sesión", error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1C1C3B" barStyle="light-content" />
      {isLoggingIn ? (
        <View style={styles.animationContainer}>
          <LottieView
            source={require("../../assets/saludo.json")} // Ruta de la animación
            autoPlay
            loop={false}
            style={styles.lottie}
          />
          <Text style={styles.welcomeText}>Bienvenido, {userName}</Text>
        </View>
      ) : showAnimation ? (
        <View style={styles.animationContainer}>
          <LottieView
            source={require("../../assets/clack2.json")}
            autoPlay
            loop={false}
            style={styles.lottie}
          />
          <Text style={styles.welcomeText}>Bienvenido!!!</Text>
        </View>
      ) : (
        <Animated.View
          style={[styles.loginContainer, { opacity: backgroundFade }]}
        >
          <Animated.Image
            source={require("../../assets/logo.png")}
            style={[
              styles.logo,
              { opacity: logoFade, transform: [{ translateY: logoMovement }] },
            ]}
            resizeMode="contain"
          />

          <Animated.View style={[styles.formContainer, { opacity: loginFade }]}>
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="white"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Contraseña"
                placeholderTextColor="white"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword} // Oculta o muestra la contraseña
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Image
                  source={
                    showPassword
                      ? require("../../assets/eye-open.png") // Icono de ojo abierto
                      : require("../../assets/eye-closed.png") // Icono de ojo cerrado
                  }
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View
                style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
              />
              <Text style={styles.checkboxLabel}>Mantener sesión iniciada</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Ingresar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.forgotPasswordText}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonOutline}
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={styles.buttonTextOutline}>Registrarse</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1C1C3B",
  },
  forgotPasswordText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginTop: 10,
    textDecorationLine: "underline",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    backgroundColor: "transparent",
    color: "white",
    padding: 12,
  },
  eyeIcon: {
    width: 24,
    height: 24,
    tintColor: "white", // Color del icono para que combine con el diseño
  },

  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  logo: {
    width: 200,
    height: 100,
    position: "absolute",
    top: "40%", // Inicia en el centro de la pantalla
    alignSelf: "center",
  },
  formContainer: {
    width: "80%",
    alignItems: "center",
    opacity: 0,
    backgroundColor: "#1C1C3B",
    padding: 20,
    borderRadius: 10,
    borderWidth: 0,
    borderColor: "white",
    marginTop: 120,
  },
  input: {
    backgroundColor: "transparent",
    color: "white",
    padding: 12,
    borderRadius: 5,
    marginBottom: 15,
    width: "100%",
    borderWidth: 1,
    borderColor: "white",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    marginRight: 10,
    borderRadius: 5,
  },
  checkboxChecked: {
    backgroundColor: "#FFFFFF",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  button: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: 0,
    borderColor: "#FFFFFF",
    padding: 15,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#1C1C3B",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonTextOutline: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  lottie: {
    width: 300,
    height: 300,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
