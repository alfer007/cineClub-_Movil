import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function Inicio() {
  const [cines, setCines] = useState([]);
  const [peliculas, setPeliculas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cinesSnap = await getDocs(collection(db, "cines"));
        const peliculasSnap = await getDocs(collection(db, "peliculas"));

        // Obtener cines
        const cinesList = cinesSnap.docs.map((doc) => doc.data());
        setCines(cinesList);

        // Películas sin duplicados por título
        const titulosUnicos = new Set();
        const peliculasList = [];

        peliculasSnap.docs.forEach((doc) => {
          const data = doc.data();
          if (!titulosUnicos.has(data.Titulo)) {
            titulosUnicos.add(data.Titulo);
            peliculasList.push(data);
          }
        });

        setPeliculas(peliculasList);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#fff" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      {/* CINES */}
      <Text style={styles.sectionTitle}>Cines</Text>
      <FlatList
        data={cines}
        horizontal
        keyExtractor={(item, index) => `cine-${index}`}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.Nombre}</Text>
            <Text style={styles.cardSubtitle}>{item.Ubicacion}</Text>
          </View>
        )}
        contentContainerStyle={styles.scrollContainer}
        showsHorizontalScrollIndicator={false}
      />

      {/* PELÍCULAS */}
      <Text style={styles.sectionTitle}>Películas</Text>
      <FlatList
        data={peliculas}
        horizontal
        keyExtractor={(item, index) => `peli-${index}`}
        renderItem={({ item }) => (
          <View style={styles.posterCard}>
            <Image
              source={{ uri: item.Cartelera }}
              style={styles.posterImage}
              resizeMode="cover"
            />
            <Text style={styles.posterTitle}>{item.Titulo}</Text>
          </View>
        )}
        contentContainerStyle={styles.scrollContainer}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c1c3b",
    paddingTop: 20,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 16,
    marginBottom: 10,
  },
  scrollContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#2c2c54",
    padding: 12,
    marginRight: 12,
    borderRadius: 10,
    width: 150,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 4,
  },
  posterCard: {
    marginRight: 12,
    alignItems: "center",
    width: 120,
  },
  posterImage: {
    width: 100,
    height: 140,
    borderRadius: 8,
    marginBottom: 6,
  },
  posterTitle: {
    fontSize: 14,
    color: "white",
    textAlign: "center",
  },
});
