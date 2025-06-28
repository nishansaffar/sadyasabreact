// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBtViymz8XKNiUyFmm6wzco_Vi6_C92f70",
  authDomain: "sadyasab-game.firebaseapp.com",
  projectId: "sadyasab-game",
  storageBucket: "sadyasab-game.firebasestorage.app",
  databaseURL: "https://sadyasab-game-default-rtdb.firebaseio.com",
  messagingSenderId: "426015850680",
  appId: "1:426015850680:web:2a759b55b9c4581ddd744d",
  measurementId: "G-CDYQEENFLL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getDatabase(app);
