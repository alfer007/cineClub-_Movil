import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import { useFocusEffect } from "@react-navigation/native";

export default function Inicio({ navigation }) {
  const [cines, setCines] = useState([]);
  const [peliculas, setPeliculas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cinesSnap = await getDocs(collection(db, "cines"));
        const peliculasSnap = await getDocs(collection(db, "peliculas"));

        // Obtener cines
        const cinesList = cinesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
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
    return (
      <ActivityIndicator size="large" color="#fff" style={{ marginTop: 50 }} />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.introContainer}>
        <Image
          source={require("../../assets/logo.png")} // ajusta la ruta si es distinta
          style={styles.logo}
        />
        <Text style={styles.introText}>
          Explora los cines disponibles, descubre las últimas películas y canjea
          tus puntos por entradas.
        </Text>
      </View>

      {/* CINES */}
      <Text style={styles.sectionTitle}>Cines</Text>
      <FlatList
        data={cines}
        horizontal
        keyExtractor={(item, index) => `cine-${index}`}
        style={{ marginBottom: -140 }}
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                const user = auth.currentUser;
                if (!user) {
                  alert("Debes iniciar sesión para continuar");
                  return;
                }
                navigation.navigate("CarteleraCine", {
                  cine: item,
                  userId: user.email,
                });
              }}
            >
              <Text style={styles.cardTitle}>{item.Nombre}</Text>
              <Text style={styles.cardSubtitle}>{item.Ubicacion}</Text>
            </TouchableOpacity>
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
            <TouchableOpacity
              style={styles.posterCard}
              onPress={() =>
                navigation.navigate("DetallePelicula", { pelicula: item })
              }
            >
              <Image
                source={{ uri: item.Cartelera }}
                style={styles.posterImage}
                resizeMode="cover"
              />
              <Text style={styles.posterTitle}>{item.Titulo}</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.scrollContainer}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  introContainer: {
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  logo: {
    width: 190,
    height: 60,
    resizeMode: "contain",
    marginBottom: 10,
  },
  introText: {
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  appName: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 6,
  },
  appDescription: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 20,
  },
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
