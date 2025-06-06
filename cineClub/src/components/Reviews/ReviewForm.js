import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
} from "react-native";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { db, auth } from "../../../firebaseConfig";

export default function ReviewForm({ pelicula, onReviewSubmit }) {
  const [texto, setTexto] = useState("");
  const [rating, setRating] = useState(0);
  const [puedeComentar, setPuedeComentar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [usuarioNombre, setUsuarioNombre] = useState("");

  useEffect(() => {
    const validarReview = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "usuarios", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUsuarioNombre(userData.nombre || "Anon");

        const entradas = userData.entradas || [];
        const visto = entradas.some(
          (e) => e.pelicula === pelicula.Titulo && e.isActived
        );
        setPuedeComentar(visto);
      }
      setLoading(false);
    };

    validarReview();
  }, [pelicula]);

  const enviarReview = async () => {
    if (!texto || rating < 0 || rating > 5) {
      Alert.alert("Error", "Completa el texto y elige una valoración válida.");
      return;
    }

    try {
      await addDoc(collection(db, "reviews"), {
        peliculaNombre: pelicula.Titulo,
        peliculaId: pelicula.id,
        usuarioId: auth.currentUser.uid,
        usuarioNombre,
        texto,
        rating,
        respuestas: [],
        timestamp: Date.now(),
      });

      Alert.alert("Gracias por tu review.");
      setTexto("");
      setRating(0);

      // Llama al callback para actualizar la lista y el selector
      if (onReviewSubmit) {
        onReviewSubmit();
      }
    } catch (error) {
      console.error("Error guardando review:", error);
      Alert.alert("Error", "No se pudo guardar la review.");
    }
  };

  if (loading) return null;

  if (!puedeComentar) {
    return (
      <Text style={{ color: "white", marginVertical: 10 }}>
        Solo puedes opinar sobre películas que ya has visto.
      </Text>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Tu valoración (0 a 5):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={rating.toString()}
        onChangeText={(val) => setRating(Number(val))}
      />

      <Text style={styles.label}>Tu comentario:</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline
        value={texto}
        onChangeText={setTexto}
        placeholder="Escribe tu opinión..."
      />

      <Button title="Enviar review" onPress={enviarReview} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#2c2c54",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: {
    color: "#fff",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
});
