import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { auth } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export default function AuthLoadingScreen({ navigation }) {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.replace("Dashboard"); // Reemplaza la pantalla actual
      } else {
        navigation.replace("Home");
      }
    });

    return () => unsubscribe();
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
}
