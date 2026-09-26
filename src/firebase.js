// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJ1Wq-MCs2xdFrBnYnAFzWX-9Rh5BAIt8",
  authDomain: "phfaagathon.firebaseapp.com",
  projectId: "phfaagathon",
  storageBucket: "phfaagathon.firebasestorage.app",
  messagingSenderId: "109431789165",
  appId: "1:109431789165:web:115a1be46946f9a0daf4c4",
  measurementId: "G-5ELJG12P8F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
npm install -g firebase-tools