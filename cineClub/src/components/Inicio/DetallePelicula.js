import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { WebView } from "react-native-webview";

export default function DetallePelicula({ route, navigation }) {
  const { pelicula } = route.params;

  const getEdadStyle = (edad) => {
    switch (edad) {
      case 18:
        return { backgroundColor: "#ff4d4d", borderColor: "#ff4d4d" }; // rojo
      case 16:
        return { backgroundColor: "#ff9900", borderColor: "#ff9900" }; // naranja
      case 12:
        return { backgroundColor: "#ffcc00", borderColor: "#ffcc00" }; // amarillo
      case 7:
        return { backgroundColor: "#3399ff", borderColor: "#3399ff" }; // azul
      case 3:
        return { backgroundColor: "#33cc33", borderColor: "#33cc33" }; // verde
      default:
        return { backgroundColor: "#aaa", borderColor: "#aaa" }; // fallback gris
    }
  };

  // Extraer el ID del video de YouTube
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/v=([^&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const videoUrl = getYouTubeEmbedUrl(pelicula.Trailer);
  const screenWidth = Dimensions.get("window").width;

  return (
    <>
      <View style={{ flex: 1, backgroundColor: "#1c1c3b" }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require("../../../assets/arrow.png")}
              style={styles.backArrow}
            />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.container}>
          {/* Cartel + info */}
          <View style={styles.topContainer}>
            <Image source={{ uri: pelicula.Cartelera }} style={styles.poster} />
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                <Text style={styles.movieTitle}>{pelicula.Titulo}</Text>
              </Text>
              <View style={[styles.edadBox, getEdadStyle(pelicula.Edad)]}>
                <Text style={styles.edadText}>{pelicula.Edad}+</Text>
              </View>

              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Duración: </Text>
                {pelicula.Duracion} min
              </Text>
            </View>
          </View>

          {/* Director y Actores */}
          <View style={styles.detailCard}>
            <Text style={styles.label}>Director:</Text>
            <Text style={styles.value}>{pelicula.Director}</Text>

            <Text style={styles.label}>Actores:</Text>
            <Text style={styles.value}>{pelicula.Actores}</Text>
          </View>

          {/* Sinopsis */}
          <View style={styles.detailCard}>
            <Text style={styles.label}>Sinopsis:</Text>
            <Text style={styles.sinopsis}>{pelicula.Sinopsis}</Text>
          </View>

          {/* Video */}
          {videoUrl && (
            <View style={styles.videoContainer}>
              <WebView
                style={{
                  height: 220,
                  width: screenWidth - 32,
                  borderRadius: 10,
                }}
                javaScriptEnabled
                domStorageEnabled
                source={{ uri: videoUrl }}
              />
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  movieTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  detailCard: {
    backgroundColor: "#2a2a4f",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    justifyContent: "center",
  },
  edadBox: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1.5,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  edadText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  infoLabel: {
    fontWeight: "bold",
    color: "white",
  },
  header: {
    backgroundColor: "white",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    elevation: 5,
  },
  backArrow: {
    width: 30,
    height: 24,
    transform: [{ rotate: "180deg" }],
    tintColor: "#1c1c3b",
  },
  container: {
    flex: 1,
    backgroundColor: "#1c1c3b",
    padding: 16,
  },
  topContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 20,
  },
  poster: {
    width: 130,
    height: 190,
    borderRadius: 10,
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  infoBox: {
    justifyContent: "center",
  },
  infoText: {
    color: "white",
    fontSize: 14,
    marginBottom: 6,
  },
  label: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 10,
    fontWeight: "bold",
  },
  value: {
    color: "white",
    fontSize: 16,
    marginBottom: 6,
  },
  sinopsis: {
    color: "white",
    fontSize: 15,
    marginTop: 6,
    lineHeight: 22,
  },
  videoContainer: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
