import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";

// ... mismos imports ...
const diasSemana = ["Vie", "Sáb", "Dom", "Lun", "Mar", "Mié", "Jue"];

const diasMap = {
  Viernes: "Vie",
  Sábado: "Sáb",
  Domingo: "Dom",
  Lunes: "Lun",
  Martes: "Mar",
  Miércoles: "Mié",
  Jueves: "Jue",
};

export default function CarteleraCine({ route, navigation }) {
  const { cine, userId } = route.params;
  const [sesiones, setSesiones] = useState([]);
  const [peliculas, setPeliculas] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCartelera = async () => {
      try {
        const sesionesRef = query(
          collection(db, "sesiones"),
          where("CineId", "==", cine.id)
        );
        const snapshot = await getDocs(sesionesRef);

        const tempSesiones = [];
        const peliIds = new Set();

        snapshot.forEach((doc) => {
          const data = doc.data();
          tempSesiones.push({ id: doc.id, ...data });
          peliIds.add(data.PeliculaId);
        });

        const peliData = {};
        for (const id of peliIds) {
          const peliSnap = await getDoc(doc(db, "peliculas", id));
          if (peliSnap.exists()) {
            peliData[id] = peliSnap.data();
          }
        }

        setSesiones(tempSesiones);
        setPeliculas(peliData);
      } catch (error) {
        console.error("Error al cargar la cartelera:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartelera();
  }, []);

  const agruparPorPelicula = () => {
    const grouped = {};
    sesiones.forEach((s) => {
      const diaAbreviado = diasMap[s.Dia] || s.Dia;
      if (!grouped[s.PeliculaId]) grouped[s.PeliculaId] = {};
      if (!grouped[s.PeliculaId][diaAbreviado])
        grouped[s.PeliculaId][diaAbreviado] = [];
      grouped[s.PeliculaId][diaAbreviado].push(s.Hora);
    });
    return grouped;
  };

  if (loading)
    return (
      <Text style={{ color: "white", margin: 20 }}>Cargando cartelera...</Text>
    );

  const agrupado = agruparPorPelicula();

  return (
    <>
      <View style={{ paddingBottom: 10, backgroundColor: "#1c1c3b" }}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Image
              source={require("../../../assets/arrow.png")}
              style={styles.backArrow}
            />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.cineNombre}>{cine.Nombre}</Text>
            <Text style={styles.cineUbicacion}>{cine.Ubicacion}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.container}>
        {Object.keys(agrupado).map((peliId) => (
          <View key={peliId} style={styles.peliBlock}>
            <View style={styles.peliRow}>
              <Image
                source={{ uri: peliculas[peliId].Cartelera }}
                style={styles.poster}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.peliTitle}>{peliculas[peliId].Titulo}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.dayRow}>
                    {diasSemana.map((dia) => (
                      <View key={dia} style={styles.dayColumn}>
                        <Text style={styles.dayLabel}>{dia}</Text>
                        {(agrupado[peliId][dia] || []).map((hora, idx) => (
                          <TouchableOpacity
                            key={idx}
                            onPress={() =>
                              navigation.navigate("SeleccionAsientos", {
                                sesion: sesiones.find(
                                  (s) =>
                                    s.PeliculaId === peliId &&
                                    diasMap[s.Dia] === dia &&
                                    s.Hora === hora
                                ),
                                pelicula: peliculas[peliId],
                                userId: userId,
                              })
                            }
                          >
                            <Text style={styles.hourTag}>{hora}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "white",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    elevation: 5,
  },
  backButton: {
    marginRight: 12,
  },
  backArrow: {
    width: 30,
    height: 24,
    transform: [{ rotate: "180deg" }],
    tintColor: "#1c1c3b",
  },
  headerTextContainer: {
    flex: 1,
    flexDirection: "column",
    marginLeft: 20,
  },
  cineNombre: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1c1c3b",
  },
  cineUbicacion: {
    fontSize: 14,
    color: "#555",
  },
  container: { flex: 1, backgroundColor: "#1c1c3b", padding: 16 },
  headerTitle: { color: "white", fontSize: 22, fontWeight: "bold" },
  headerSub: { color: "#ccc", marginBottom: 20 },
  peliBlock: { marginBottom: 30 },
  peliRow: { flexDirection: "row", gap: 10 },
  poster: { width: 60, height: 85, borderRadius: 8, marginRight: 12 },
  peliTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  dayRow: {
    flexDirection: "row",
    gap: 16,
  },
  dayColumn: {
    alignItems: "center",
    marginRight: 10,
  },
  dayLabel: {
    color: "#ccc",
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 13,
  },
  hourTag: {
    backgroundColor: "#2ecc71",
    color: "white",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
    fontSize: 13,
  },
});
