import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { doc, getDoc } from "firebase/firestore";
import LottieView from "lottie-react-native";
import UserAvatar from "../components/UserAvatar";

import Inicio from "../components/Inicio";
import MisEntradas from "../components/MisEntradas";
import CanjearPuntos from "../components/CanjearPuntos";
import Reviews from "../components/Reviews";

export default function Dashboard({ navigation }) {
  const [userUID, setUserUID] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userPoints, setUserPoints] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("Inicio"); // Estado para manejar la selección
  const [playHomeAnimation, setPlayHomeAnimation] = useState(false);
  const [playTicketAnimation, setPlayTicketAnimation] = useState(false);
  const [playRewardAnimation, setPlayRewardAnimation] = useState(false);
  const [playReviewdAnimation, setPlayReviewdAnimation] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        let storedUID = await AsyncStorage.getItem("userUID");

        if (!storedUID && auth.currentUser) {
          storedUID = auth.currentUser.uid;
        }

        if (storedUID) {
          const userDocRef = doc(db, "usuarios", storedUID);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserName(userData.nombre || "Usuario");
            setUserPoints(userData.puntos || 0);
          } else {
            console.log("No se encontró el usuario en la base de datos");
          }
          setUserUID(storedUID);
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const renderComponent = () => {
    switch (selectedTab) {
      case "Inicio":
        return <Inicio navigation={navigation} />;
      case "Mis Entradas":
        return <MisEntradas />;
      case "Canjear Puntos":
        return (
          <CanjearPuntos
            userPoints={userPoints}
            userUID={userUID}
            onUpdatePoints={(newPoints) => setUserPoints(newPoints)}
          />
        );
      case "Reviews":
        return <Reviews />;
      default:
        return <Inicio />;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem("userUID");
      navigation.replace("Home");
    } catch (error) {
      Alert.alert("Error al cerrar sesión", error.message);
    }
  };

  const handleTabChange = (tab) => {
    setSelectedTab(tab);

    if (tab === "Inicio") {
      setPlayHomeAnimation(true);
      setTimeout(() => setPlayHomeAnimation(false), 2000); // Detener después de 2s
    } else if (tab === "Mis Entradas") {
      setPlayTicketAnimation(true);
      setTimeout(() => setPlayTicketAnimation(false), 2000);
    } else if (tab === "Canjear Puntos") {
      setPlayRewardAnimation(true);
      setTimeout(() => setPlayRewardAnimation(false), 2000);
    } else if (tab === "Reviews") {
      setPlayReviewdAnimation(true);
      setTimeout(() => setPlayReviewdAnimation(false), 2000);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        hidden={false}
        backgroundColor="white"
        barStyle="dark-content"
      />
      {/* Header */}
      <View style={styles.header}>
        <View>
          {loading ? (
            <ActivityIndicator size="small" color="#333" />
          ) : (
            <>
              <Text style={styles.welcomeText}>Bienvenido, {userName}</Text>
              <Text style={styles.pointsText}>Mis puntos: {userPoints}</Text>
            </>
          )}
        </View>

        {/* Menú desplegable en el icono del usuario */}
        <Menu>
          <MenuTrigger>
            <UserAvatar name={userName} size={40} />
          </MenuTrigger>
          <MenuOptions customStyles={optionsStyles}>
            <MenuOption onSelect={() => navigation.navigate("EditProfile")}>
              <View style={styles.menuOptionContainer}>
                <Text style={styles.menuOptionText}>Editar Usuario</Text>
                <Image
                  source={require("../../assets/edit-icon.png")}
                  style={styles.optionIcon}
                />
              </View>
            </MenuOption>

            <MenuOption onSelect={handleLogout}>
              <View style={styles.menuOptionContainer}>
                <Text style={[styles.menuOptionText, { color: "red" }]}>
                  Cerrar Sesión
                </Text>
                <Image
                  source={require("../../assets/log-out.png")}
                  style={styles.optionIcon}
                />
              </View>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>

      <View style={styles.contentContainer}>{renderComponent()}</View>

      {/* Contenido del Dashboard */}
      <View style={styles.bottomMenu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleTabChange("Inicio")}
        >
          {selectedTab === "Inicio" && playHomeAnimation ? (
            <LottieView
              source={require("../../assets/home-animation.json")}
              autoPlay
              loop={false}
              style={styles.lottieIcon}
            />
          ) : (
            <Image
              source={require("../../assets/home-icon.png")}
              style={styles.menuIcon}
            />
          )}
          <Text
            style={[
              styles.menuText,
              selectedTab === "Inicio" && styles.selectedText,
            ]}
          >
            Inicios
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleTabChange("Mis Entradas")}
        >
          {selectedTab === "Mis Entradas" && playTicketAnimation ? (
            <LottieView
              source={require("../../assets/ticket-animation.json")}
              autoPlay
              loop={false}
              style={styles.lottieIcon}
            />
          ) : (
            <Image
              source={require("../../assets/ticket-icon.png")}
              style={styles.menuIcon}
            />
          )}
          <Text
            style={[
              styles.menuText,
              selectedTab === "Mis Entradas" && styles.selectedText,
            ]}
          >
            Entradas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleTabChange("Reviews")}
        >
          {selectedTab === "Reviews" && playReviewdAnimation ? (
            <LottieView
              source={require("../../assets/review-animation.json")}
              autoPlay
              loop={false}
              style={styles.lottieIcon}
            />
          ) : (
            <Image
              source={require("../../assets/review-icon.png")}
              style={styles.menuIcon}
            />
          )}
          <Text
            style={[
              styles.menuText,
              selectedTab === "Reviews" && styles.selectedText,
            ]}
          >
            Reviews
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleTabChange("Canjear Puntos")}
        >
          {selectedTab === "Canjear Puntos" && playRewardAnimation ? (
            <LottieView
              source={require("../../assets/reward-animation.json")}
              autoPlay
              loop={false}
              style={styles.lottieIcon}
            />
          ) : (
            <Image
              source={require("../../assets/reward-icon.png")}
              style={styles.menuIcon}
            />
          )}
          <Text
            style={[
              styles.menuText,
              selectedTab === "Canjear Puntos" && styles.selectedText,
            ]}
          >
            Puntos
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c1c3b",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  menuOptionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },
  optionIcon: {
    width: 20,
    height: 20,
    marginLeft: 10,
  },
  header: {
    backgroundColor: "white",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1c1c3b",
  },
  pointsText: {
    fontSize: 16,
    color: "#1c1c3b",
  },
  userIcon: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingBottom: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1c1c3b",
  },

  /* Menú inferior */
  bottomMenu: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  menuItem: {
    alignItems: "center",
    flex: 1,
  },
  menuIcon: {
    width: 24,
    height: 24,
    marginBottom: 5,
    color: "#1c1c3b",
  },
  lottieIcon: {
    width: 24,
    height: 24,
    marginBottom: 5,
    color: "#1c1c3b",
  },
  menuText: {
    fontSize: 14,
    color: "#1c1c3b",
  },
  selectedText: {
    color: "#1C1C3B",
    fontWeight: "bold",
  },

  /* Estilos del menú desplegable */
  menuOptionText: {
    fontSize: 16,
    padding: 10,
  },
});

const optionsStyles = {
  optionsContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 5,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
};
