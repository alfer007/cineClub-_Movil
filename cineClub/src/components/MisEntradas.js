import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from "react-native";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import QRCode from "react-native-qrcode-svg";

export default function MisEntradas() {
  const [entradas, setEntradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntrada, setSelectedEntrada] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const user2 = auth.currentUser;

  useEffect(() => {
    const fetchEntradas = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const noActivadas = (data.entradas || []).filter((e) => !e.isActived);
          setEntradas(noActivadas);
        }
      } catch (error) {
        console.error("Error cargando entradas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntradas();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  if (!entradas.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No tienes entradas disponibles.</Text>
      </View>
    );
  }

  const renderEntrada = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedEntrada(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.card}>
        <Text style={styles.title}>{item.pelicula}</Text>
        <Text style={styles.detail}>Cine: {item.cine}</Text>
        <Text style={styles.detail}>Fecha: {item.dia}</Text>
        <Text style={styles.detail}>Hora: {item.hora}</Text>
        <Text style={styles.detail}>Sala: {item.sala}</Text>
        <Text style={styles.detail}>Cantidad: {item.cantidad}</Text>
        <Text style={styles.detail}>
          Asientos:{" "}
          {item.asientos
            ?.map((a) => `Fila ${a.fila} Asiento ${a.columna}`)
            .join(" | ")}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={entradas}
        keyExtractor={(_, index) => `entrada-${index}`}
        renderItem={renderEntrada}
        contentContainerStyle={{ padding: 16 }}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedEntrada && (
              <>
                <QRCode
                  value={`entrada-${user2.uid}-${selectedEntrada.pelicula}-${
                    selectedEntrada.cine
                  }-${selectedEntrada.dia}-${selectedEntrada.hora}-${
                    selectedEntrada.sala
                  }-${selectedEntrada.cantidad}-${selectedEntrada.asientos
                    .map((a) => `Fila ${a.fila} Asiento ${a.columna}`)
                    .join(" | ")}`}
                  size={200}
                />

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setModalVisible(false);
                    setSelectedEntrada(null);
                  }}
                >
                  <Text style={styles.closeText}>Cerrar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#1c1c3b",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeText: {
    color: "white",
    fontWeight: "bold",
  },
  container: { flex: 1, backgroundColor: "#1c1c3b" },
  emptyText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },
  card: {
    backgroundColor: "#2c2c54",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 6,
  },
  detail: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 2,
  },
});
