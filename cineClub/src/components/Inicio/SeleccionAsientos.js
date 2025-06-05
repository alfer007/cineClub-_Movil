import React, { useState } from "react";
import Svg, { Path } from "react-native-svg";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from "react-native";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

const imagenes = {
  libre: "https://i.imgur.com/YugIl3m.png",
  ocupado: "https://i.imgur.com/gRc9Evd.png",
  seleccionado: "https://i.imgur.com/deJdZM5.png",
  nulo: "https://i.imgur.com/lGit7Uo.png",
};

export default function SeleccionAsientos({ route, navigation }) {
  const { sesion, pelicula, userId } = route.params;
  const [asientosSeleccionados, setAsientosSeleccionados] = useState([]);

  const filas = sesion.SalaInfo.Filas;
  const columnas = sesion.SalaInfo.Columnas;
  const plano = sesion.SalaInfo.Asientos; // array plano

  console.log("Filas:", filas, "Columnas:", columnas);
  console.log("Asientos (plano):", plano);

  const matriz = [];
  for (let i = 0; i < filas; i++) {
    matriz.push(plano.slice(i * columnas, (i + 1) * columnas));
  }

  const asientoSize = columnas > 10 ? 25 : 35;
  const screenWidth = Dimensions.get("window").width;

  const toggleAsiento = (i, j) => {
    if (matriz[i][j] !== 1) return;
    const key = `${i}-${j}`;
    setAsientosSeleccionados((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]
    );
  };

  const getImagenAsiento = (i, j) => {
    const key = `${i}-${j}`;
    if (matriz[i][j] === 0) return imagenes.nulo;
    if (matriz[i][j] === 2) return imagenes.ocupado;
    if (asientosSeleccionados.includes(key)) return imagenes.seleccionado;
    return imagenes.libre;
  };

  const pagarYConfirmar = async () => {
    if (asientosSeleccionados.length === 0) {
      Alert.alert("Selecciona al menos un asiento.");
      return;
    }

    // Confirmar pago
    Alert.alert(
      "Confirmar pago",
      `¿Deseas pagar ${asientosSeleccionados.length * 7}€ por ${
        asientosSeleccionados.length
      } asiento(s)?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Pagar",
          onPress: async () => {
            try {
              // Actualizar matriz local
              const nuevosAsientos = plano.slice();
              asientosSeleccionados.forEach((k) => {
                const [i, j] = k.split("-").map(Number);
                nuevosAsientos[i * columnas + j] = 2;
              });

              // Guardar en Firestore
              await updateDoc(doc(db, "sesiones", sesion.id), {
                "SalaInfo.Asientos": nuevosAsientos,
              });

              // Actualizar usuario: puntos + entrada
              const userRef = doc(db, "usuarios", userId);
              const userSnap = await getDoc(userRef);
              const userData = userSnap.data();

              const nuevosPuntos =
                (userData.puntos || 0) + asientosSeleccionados.length * 50;
              const nuevaEntrada = {
                pelicula: pelicula.Titulo,
                dia: sesion.Dia,
                hora: sesion.Hora,
                sala: sesion.SalaInfo.Nombre,
                isActived: false,
                cantidad: asientosSeleccionados.length,
              };

              await updateDoc(userRef, {
                puntos: nuevosPuntos,
                entradas: [...(userData.entradas || []), nuevaEntrada],
              });

              Alert.alert(
                "¡Reserva completada!",
                "Tus puntos han sido añadidos."
              );
              navigation.popToTop();
            } catch (error) {
              console.error("Error al confirmar:", error);
              Alert.alert("Error", "Hubo un problema al confirmar la reserva.");
            }
          },
        },
      ]
    );
  };

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
          <Text style={styles.titulo}>Selecciona tus asientos</Text>

          <ScrollView
            horizontal
            style={{ backgroundColor: "white", borderRadius: 10 }}
          >
            <View
              style={{
                minWidth: screenWidth,
                alignItems: "center",
                paddingTop: 30,
              }}
            >
              <View style={styles.grid}>
                {matriz.map((fila, i) => (
                  <View key={i} style={styles.row}>
                    {fila.map((val, j) => (
                      <TouchableOpacity
                        key={j}
                        onPress={() => toggleAsiento(i, j)}
                      >
                        <Image
                          source={{ uri: getImagenAsiento(i, j) }}
                          style={[
                            styles.asiento,
                            { width: asientoSize, height: asientoSize },
                          ]}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
                <View style={styles.pantallaContainer}>
                  <Text style={styles.pantallaTexto}>PANTALLA</Text>
                  <Svg
                    height="60"
                    width={columnas * asientoSize}
                    style={{ transform: [{ scaleY: -1 }] }}
                  >
                    <Path
                      d={`M10,50 Q${(columnas * asientoSize) / 2},10 ${
                        columnas * asientoSize - 10
                      },50`}
                      stroke="#1c1c3b"
                      strokeWidth="3"
                      fill="none"
                    />
                  </Svg>
                </View>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.botonConfirmar}
            onPress={pagarYConfirmar}
          >
            <Text style={styles.textoBoton}>Pagar y Confirmar</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
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
    justifyContent: "flex-start",
    elevation: 5,
  },
  backArrow: {
    width: 30,
    height: 24,
    transform: [{ rotate: "180deg" }],
    tintColor: "#1c1c3b",
  },
  pantallaContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  pantallaTexto: {
    color: "#1c1c3b",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 4,
  },
  container: {
    flex: 1,
    backgroundColor: "#1c1c3b", 
    padding: 16,
  },
  titulo: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  grid: {
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  asiento: {
    marginHorizontal: 3,
  },

  botonConfirmar: {
    marginTop: 10,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 20,
    alignItems: "center",
  },
  textoBoton: {
    color: "#1c1c3b",
    fontWeight: "bold",
    fontSize: 16,
  },
});
