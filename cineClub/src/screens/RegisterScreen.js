import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, Text, Image } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { setDoc, doc } from "firebase/firestore";

export default function RegisterScreen({ navigation }) {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [nombre, setNombre] = useState("");
   const [showPassword, setShowPassword] = useState(false); 

   const handleRegister = async () => {
      if (!nombre || !email || !password) {
         Alert.alert("Error", "Por favor, completa todos los campos");
         return;
      }

      try {
         // Crear usuario en Firebase Authentication
         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
         const user = userCredential.user;

         console.log("Usuario registrado:", user.uid);

         await setDoc(doc(db, "usuarios", user.uid), {
            nombre: nombre,
            email: email,
            puntos: 0,
            rol: "usuario",
            createdAt: new Date().toISOString()
         });

         Alert.alert("Registro exitoso", "Bienvenido!");
         navigation.replace("Dashboard"); 

      } catch (error) {
         console.error("Error al registrar:", error);
         Alert.alert("Error al registrar", error.message);
      }
   };

   return (
      <View style={styles.container}>
         {/* Logo sin animación */}
         <Image source={require("../../assets/logo.png")} style={styles.logo} resizeMode="contain" />

         {/* Formulario */}
         <View style={styles.formContainer}>
            <TextInput
               style={styles.input}
               placeholder="Nombre"
               placeholderTextColor="white"
               value={nombre}
               onChangeText={setNombre}
            />
            <TextInput
               style={styles.input}
               placeholder="Correo electrónico"
               placeholderTextColor="white"
               value={email}
               onChangeText={setEmail}
               keyboardType="email-address"
            />

            {/* Campo de contraseña con icono de ojo */}
            <View style={styles.passwordContainer}>
               <TextInput
                  style={styles.passwordInput}
                  placeholder="Contraseña"
                  placeholderTextColor="white"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword} // Oculta o muestra la contraseña
               />
               <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Image
                     source={
                        showPassword
                           ? require("../../assets/eye-open.png") // Ícono de ojo abierto
                           : require("../../assets/eye-closed.png") // Ícono de ojo cerrado
                     }
                     style={styles.eyeIcon}
                  />
               </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
               <Text style={styles.buttonText}>Registrarse</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.buttonOutline} onPress={() => navigation.navigate("Home")}>
               <Text style={styles.buttonTextOutline}>Volver al inicio</Text>
            </TouchableOpacity>
         </View>
      </View>
   );
}

// Estilos
const styles = StyleSheet.create({
   container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#1C1C3B",
      paddingHorizontal: 20,
   },
   logo: {
      width: 200,
      height: 100,
      marginBottom: 20,
   },
   formContainer: {
      width: "100%",
      alignItems: "center",
      backgroundColor: "#1C1C3B",
      padding: 20,
      borderRadius: 10,
      borderWidth: 0,
      borderColor: "white",
   },
   input: {
      backgroundColor: "transparent",
      color: "white",
      padding: 12,
      borderRadius: 5,
      marginBottom: 15,
      width: "100%",
      borderWidth: 1,
      borderColor: "white",
   },
   passwordContainer: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      borderWidth: 1,
      borderColor: "white",
      borderRadius: 5,
      paddingHorizontal: 10,
      marginBottom: 15,
   },
   passwordInput: {
      flex: 1,
      backgroundColor: "transparent",
      color: "white",
      padding: 12,
   },
   eyeIcon: {
      width: 24,
      height: 24,
      tintColor: "white", // Cambia el color del icono a blanco
   },
   button: {
      backgroundColor: "white",
      padding: 15,
      borderRadius: 5,
      width: "100%",
      alignItems: "center",
   },
   buttonOutline: {
      backgroundColor: "transparent",
      borderWidth: 0,
      borderColor: "white",
      padding: 15,
      borderRadius: 5,
      width: "100%",
      alignItems: "center",
      marginTop: 10,
   },
   buttonText: {
      color: "#1C1C3B",
      fontSize: 16,
      fontWeight: "bold",
   },
   buttonTextOutline: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
   },
});

