import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function MisEntradas() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Mis Entradas</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 18, fontWeight: "bold", color: "white" },
});
