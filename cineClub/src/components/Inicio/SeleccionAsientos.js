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
  TextInput,
} from "react-native";
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { db } from "../../../firebaseConfig";

const imagenes = {
  libre: "https://i.imgur.com/YugIl3m.png",
  ocupado: "https://i.imgur.com/gRc9Evd.png",
  seleccionado: "https://i.imgur.com/deJdZM5.png",
  nulo: "https://i.imgur.com/lGit7Uo.png",
};

export default function SeleccionAsientos({ route, navigation }) {
  const { sesion, pelicula, userId, cine } = route.params;
  const [asientosSeleccionados, setAsientosSeleccionados] = useState([]);

  console.log("Email recibido en SeleccionAsientos:", userId);

  const [pagoVisible, setPagoVisible] = useState(false);
  const [tarjeta, setTarjeta] = useState("");
  const [caducidad, setCaducidad] = useState("");
  const [cvv, setCvv] = useState("");
  const [titular, setTitular] = useState("");

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

  const pagarYConfirmar = () => {
    if (asientosSeleccionados.length === 0) {
      Alert.alert("Selecciona al menos un asiento.");
      return;
    }
    setPagoVisible(true); // mostrar el formulario
  };

  const confirmarPago = async () => {
  if (!tarjeta || !caducidad || !cvv || !titular) {
    Alert.alert("Rellena todos los campos del pago.");
    return;
  }

  console.log("---- Iniciando pago ----");
  console.log("Tarjeta:", tarjeta);
  console.log("Caducidad:", caducidad);
  console.log("CVV:", cvv);
  console.log("Titular:", titular);
  console.log("Asientos seleccionados:", asientosSeleccionados);

  try {
    const nuevosAsientos = plano.slice(); 
    const posiciones = [];

    asientosSeleccionados.forEach((k) => {
      const [i, j] = k.split("-").map(Number);
      nuevosAsientos[i * columnas + j] = 2;
      posiciones.push({ fila: i + 1, columna: j + 1 });
    });

    console.log("Nuevos asientos planos:", nuevosAsientos);
    console.log("Posiciones (fila/col):", posiciones);

    await updateDoc(doc(db, "sesiones", sesion.id), {
      "SalaInfo.Asientos": nuevosAsientos,
    });

    // Buscar usuario por email
    const q = query(collection(db, "usuarios"), where("email", "==", userId)); // aquí userId es en realidad el email
    const snap = await getDocs(q);

    if (snap.empty) {
      Alert.alert("Usuario no encontrado en Firestore.");
      return;
    }

    const userRef = snap.docs[0].ref;
    const userData = snap.docs[0].data();

    const nuevosPuntos = (userData.puntos || 0) + asientosSeleccionados.length * 50;
    const nuevaEntrada = {
      pelicula: pelicula.Titulo,
      cine: cine.Nombre,
      dia: sesion.Dia,
      hora: sesion.Hora,
      sala: sesion.SalaInfo.Nombre,
      isActived: false,
      cantidad: asientosSeleccionados.length,
      asientos: posiciones,
    };

    const entradasActuales = userData.entradas || [];

    await updateDoc(userRef, {
      puntos: nuevosPuntos,
      entradas: [...entradasActuales, nuevaEntrada],
    });

    Alert.alert("¡Pago realizado!", "Tus entradas han sido guardadas.");
    navigation.popToTop();
  } catch (error) {
    console.error("Error en el pago:", error);
    Alert.alert("Error", "No se pudo procesar el pago.");
  }
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

          {pagoVisible && (
            <View style={styles.formularioPago}>
              <Text style={styles.label}>Número de tarjeta</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={tarjeta}
                onChangeText={setTarjeta}
              />

              <Text style={styles.label}>Caducidad (MM/AA)</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/AA"
                value={caducidad}
                onChangeText={setCaducidad}
              />

              <Text style={styles.label}>CVV</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={cvv}
                onChangeText={setCvv}
              />

              <Text style={styles.label}>Titular</Text>
              <TextInput
                style={styles.input}
                value={titular}
                onChangeText={setTitular}
              />

              <TouchableOpacity
                style={styles.botonConfirmar}
                onPress={confirmarPago}
              >
                <Text style={styles.textoBoton}>Confirmar pago</Text>
              </TouchableOpacity>
            </View>
          )}

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
  formularioPago: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 30,
  },
  label: {
    color: "#1c1c3b",
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#eee",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
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
