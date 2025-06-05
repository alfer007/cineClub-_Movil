import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ListaCanjeables from "./Puntos/ListaCanjeables";

export default function CanjearPuntos({ userPoints, userUID, onUpdatePoints }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Canjea tus puntos</Text>
       <ListaCanjeables
        userPoints={userPoints}
        userUID={userUID}
        onUpdatePoints={onUpdatePoints}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingHorizontal: 5,
    backgroundColor: "#1c1c3b",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
});
