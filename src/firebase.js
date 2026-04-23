import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBKJ0Xg-HYGVkbDv9r-6WPYMtjMnsGXsM4",
  authDomain: "henho-4a94c.firebaseapp.com",
  projectId: "henho-4a94c",
  storageBucket: "henho-4a94c.firebasestorage.app",
  messagingSenderId: "643929352614",
  appId: "1:643929352614:web:b8817dc77ea008a5558767",
  measurementId: "G-51TWXZ7B8J"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);