// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvlCgQxhJxsQGA5UXIufTosrgve2uVUeU",
  authDomain: "tinder-356e8.firebaseapp.com",
  projectId: "tinder-356e8",
  storageBucket: "tinder-356e8.appspot.com",
  messagingSenderId: "298461654119",
  appId: "1:298461654119:web:2a77b6e89e9a33a6caf8c2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

export { auth, db };
