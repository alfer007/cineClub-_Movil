import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAPgHdLEch0TU1BW9KZ4z_qZsKia-WwarE",
    authDomain: "cineclub-62898.firebaseapp.com",
    projectId: "cineclub-62898",
    storageBucket: "cineclub-62898.firebasestorage.app",
    messagingSenderId: "396717763094",
    appId: "1:396717763094:web:ef5381d2f762156679a337",
    measurementId: "G-JVS70ZW6QH"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const analytics = getAnalytics(app);
export const googleClientId = "396717763094-fmdca94ol8al2kggnktf80skb7q9c92q.apps.googleusercontent.com";