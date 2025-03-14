// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // Import GoogleAuthProvider

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyANk4tOk7yr0WYu9_513D3Nf3LW3qJQUYo",
  authDomain: "mylearning-hub.firebaseapp.com",
  projectId: "mylearning-hub",
  storageBucket: "mylearning-hub.appspot.com",
  messagingSenderId: "264915107592",
  appId: "1:264915107592:web:ecb202cc28452dc4beb6bd",
  measurementId: "G-H2EVSSSPQ8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); // Initialize GoogleAuthProvider