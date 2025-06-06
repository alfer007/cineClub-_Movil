import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import ReviewCard from "./Reviews/ReviewCard";
import ReviewForm from "./Reviews/ReviewForm";
import { Picker } from "@react-native-picker/picker";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [peliculasVistas, setPeliculasVistas] = useState([]);
  const [usuarioNombre, setUsuarioNombre] = useState("");
  const [peliculaSeleccionada, setPeliculaSeleccionada] = useState("");

  const fetchReviews = async () => {
    const snap = await getDocs(collection(db, "reviews"));
    const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setReviews(lista);
  };

  const fetchData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userSnap = await getDocs(collection(db, "usuarios"));
    const usuario = userSnap.docs.find((doc) => doc.id === user.uid);
    const data = usuario?.data();
    setUsuarioNombre(data?.nombre || "Anon");

    const vistas = (data?.entradas || [])
      .filter((e) => e.isActived)
      .map((e) => e.pelicula);

    setPeliculasVistas(vistas);

    await fetchReviews();
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReviewSubmit = () => {
    // Elimina la película seleccionada para no repetir review
    setPeliculasVistas((prev) =>
      prev.filter((titulo) => titulo !== peliculaSeleccionada)
    );
    setPeliculaSeleccionada(""); // resetea el picker
    fetchReviews(); // recarga lista de reviews
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.formWrapper}>
        {peliculasVistas.length > 0 ? (
          <>
            <Text style={styles.formTitle}>
              Selecciona una película para dejar tu review:
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={peliculaSeleccionada}
                onValueChange={(itemValue) =>
                  setPeliculaSeleccionada(itemValue)
                }
                style={styles.picker}
                dropdownIconColor="#fff"
              >
                <Picker.Item label="-- Elegir película --" value="" />
                {peliculasVistas.map((titulo, index) => (
                  <Picker.Item label={titulo} value={titulo} key={index} />
                ))}
              </Picker>
            </View>

            {peliculaSeleccionada !== "" && (
              <ReviewForm
                pelicula={{
                  Titulo: peliculaSeleccionada,
                  id: `id-${peliculaSeleccionada}`,
                }}
                onReviewSubmit={handleReviewSubmit}
              />
            )}
          </>
        ) : (
          <Text style={styles.notice}>
            Primero debes ver una película para comentar.
          </Text>
        )}
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReviewCard
            review={item}
            currentUserId={auth.currentUser?.uid}
            onReviewDeleted={fetchReviews}
            onReviewUpdated={fetchReviews}
          />
        )}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1c1c3b" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  formWrapper: { padding: 16 },
  notice: { color: "#ccc", textAlign: "center", marginVertical: 16 },
  formTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: "#1c1c3b",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 16,
  },
  picker: {
    height: 60,
    color: "white",
  },
});
