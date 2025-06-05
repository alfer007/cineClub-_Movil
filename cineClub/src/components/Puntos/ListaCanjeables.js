import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

export default function ListaCanjeables({
  userPoints,
  userUID,
  onUpdatePoints,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const itemsRef = collection(db, "items");
        const snapshot = await getDocs(itemsRef);
        const itemList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(itemList);
      } catch (error) {
        console.error("Error al obtener los ítems:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handlePress = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => {
    const canRedeem = userPoints >= item.precio;

    return (
      <TouchableOpacity
        disabled={!canRedeem}
        style={[styles.card, !canRedeem && styles.cardDisabled]}
        onPress={() => handlePress(item)}
      >
        <Image
          source={{ uri: item.imagen }}
          style={[styles.image, !canRedeem && styles.imageDisabled]}
        />
        <View style={styles.info}>
          <Text style={[styles.name, !canRedeem && styles.textDisabled]}>
            {item.nombre}
          </Text>
          <Text style={[styles.price, !canRedeem && styles.textDisabled]}>
            {item.precio} puntos
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedItem && (
              <>
                <QRCode
                  value={`item-${selectedItem.nombre}-${selectedItem.precio}-${userUID}`}
                  size={200}
                />
                <Pressable
                  onPress={async () => {
                    try {
                      const userRef = doc(db, "usuarios", userUID);
                      const userSnap = await getDoc(userRef);

                      if (userSnap.exists()) {
                        const nuevosPuntos = userSnap.data().puntos || 0;
                        onUpdatePoints(nuevosPuntos);
                      }
                    } catch (err) {
                      console.error("Error al actualizar puntos:", err);
                    }

                    setModalVisible(false);
                    setSelectedItem(null);
                  }}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeText}>Cerrar</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: 10,
  },
  card: {
    backgroundColor: "#2c2c54",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardDisabled: {
    opacity: 0.4,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  imageDisabled: {
    opacity: 0.6,
  },
  info: {
    flex: 1,
  },
  name: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  price: {
    color: "#ccc",
    fontSize: 14,
    marginTop: 4,
  },
  textDisabled: {
    color: "#aaa",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 20,
    color: "#1c1c3b",
    fontWeight: "bold",
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
});
