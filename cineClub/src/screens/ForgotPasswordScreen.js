import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebaseConfig";

export default function ForgotPasswordScreen({ navigation }) {
   const [email, setEmail] = useState("");

   const handlePasswordReset = async () => {
      if (!email) {
         Alert.alert("Error", "Por favor ingresa tu correo electrónico para restablecer la contraseña.");
         return;
      }

      try {
         await sendPasswordResetEmail(auth, email);
         Alert.alert("Correo enviado", "Hemos enviado un enlace a tu correo para restablecer tu contraseña.");
         navigation.goBack(); // Vuelve a la pantalla anterior (Login)
      } catch (error) {
         Alert.alert("Error", error.message);
      }
   };

   return (
      <View style={styles.container}>
         <Text style={styles.title}>Restablecer Contraseña</Text>
         <Text style={styles.subtitle}>Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</Text>

         <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="white"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
         />

         <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
            <Text style={styles.buttonText}>Enviar correo</Text>
         </TouchableOpacity>

         <TouchableOpacity style={styles.buttonOutline} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonTextOutline}>Volver</Text>
         </TouchableOpacity>
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
      padding: 20,
   },
   title: {
      fontSize: 24,
      fontWeight: "bold",
      color: "white",
      marginBottom: 10,
   },
   subtitle: {
      fontSize: 16,
      color: "white",
      textAlign: "center",
      marginBottom: 20,
   },
   input: {
      width: "100%",
      padding: 15,
      borderWidth: 1,
      borderColor: "white",
      color: "white",
      borderRadius: 10,
      marginBottom: 15,
      fontSize: 16,
   },
   button: {
      backgroundColor: "white",
      padding: 15,
      borderRadius: 10,
      width: "100%",
      alignItems: "center",
      marginBottom: 10,
   },
   buttonOutline: {
      backgroundColor: "transparent",
      borderColor: "white",
      borderWidth: 0,
      padding: 15,
      borderRadius: 10,
      width: "100%",
      alignItems: "center",
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
