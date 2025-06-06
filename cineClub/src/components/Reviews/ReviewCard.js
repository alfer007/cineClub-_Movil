import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Image,
} from "react-native";
import {
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../../../firebaseConfig";

export default function ReviewCard({
  review,
  onReviewDeleted,
  onReviewUpdated,
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [respuestaTexto, setRespuestaTexto] = useState("");
  const [usuarioNombre, setUsuarioNombre] = useState("Anon");

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchNombre = async () => {
      if (!userId) return;
      try {
        const userRef = doc(db, "usuarios", userId);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setUsuarioNombre(data.nombre || "Anon");
        }
      } catch (err) {
        console.error("Error obteniendo nombre:", err);
      }
    };

    fetchNombre();
  }, [userId]);

  const handleDelete = async () => {
    if (!review.id) return;

    Alert.alert(
      "Eliminar review",
      "¿Estás seguro de que quieres eliminar esta review?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "reviews", review.id));
              Alert.alert("Review eliminada");
              onReviewDeleted?.();
            } catch (error) {
              console.error("Error al eliminar la review:", error);
              Alert.alert("Error", "No se pudo eliminar la review.");
            }
          },
        },
      ]
    );
  };

  const enviarRespuesta = async () => {
    if (!respuestaTexto.trim()) return;

    try {
      const nuevaRespuesta = {
        texto: respuestaTexto.trim(),
        usuarioNombre,
        timestamp: Date.now(),
      };

      const reviewRef = doc(db, "reviews", review.id);
      await updateDoc(reviewRef, {
        respuestas: arrayUnion(nuevaRespuesta),
      });

      setRespuestaTexto("");
      onReviewUpdated?.();
    } catch (err) {
      console.error("Error al enviar respuesta:", err);
      Alert.alert("Error", "No se pudo enviar la respuesta.");
    }
  };

  return (
    <View style={styles.card}>
      {userId === review.usuarioId && (
        <TouchableOpacity onPress={handleDelete} style={styles.deleteIcon}>
          <Image
            source={require("../../../assets/trash.png")} // Asegúrate que esta ruta es válida
            style={styles.deleteImage}
          />
        </TouchableOpacity>
      )}

      <Text style={styles.user}>{review.usuarioNombre}</Text>
      <Text style={styles.movie}>{review.peliculaNombre}</Text>
      <Text style={styles.stars}>
        {"★".repeat(review.rating)}
        {"☆".repeat(5 - review.rating)}
      </Text>
      <Text style={styles.text}>{review.texto}</Text>

      <TouchableOpacity onPress={() => setShowReplies(!showReplies)}>
        <Text style={styles.toggleReplies}>
          {showReplies ? "Ocultar respuestas" : "Mostrar respuestas"}
        </Text>
      </TouchableOpacity>

      {showReplies && (
        <>
          <FlatList
            data={review.respuestas || []}
            keyExtractor={(_, i) => `respuesta-${i}`}
            renderItem={({ item }) => (
              <View style={styles.reply}>
                <Text style={styles.replyUser}>{item.usuarioNombre}:</Text>
                <Text style={styles.replyText}>{item.texto}</Text>
              </View>
            )}
          />
          <TextInput
            style={styles.replyInput}
            value={respuestaTexto}
            onChangeText={setRespuestaTexto}
            placeholder="Escribe una respuesta..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity onPress={enviarRespuesta} style={styles.replyButton}>
            <Text style={{ color: "white", fontWeight: "bold" }}>Responder</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#2c2c54",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    position: "relative",
  },
  deleteIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
  },
  deleteImage: {
    width: 20,
    height: 20,
  },
  user: { color: "#fff", fontWeight: "bold" },
  movie: { color: "#ccc", fontSize: 13 },
  stars: { color: "#f1c40f", marginVertical: 4 },
  text: { color: "#eee", marginBottom: 8 },
  toggleReplies: { color: "#00aaff", marginTop: 4 },
  reply: { paddingLeft: 12, marginTop: 6 },
  replyUser: { color: "#ffa", fontWeight: "bold" },
  replyText: { color: "#ddd" },
  replyInput: {
    backgroundColor: "#1c1c3b",
    color: "#fff",
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  replyButton: {
    marginTop: 6,
    backgroundColor: "#1c1c3b",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
});
