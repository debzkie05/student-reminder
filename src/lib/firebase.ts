import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCRcYZTGaS7EDowSkIz86rsDGaoeEpCTNI",
  authDomain: "student-reminder-c5438.firebaseapp.com",
  projectId: "student-reminder-c5438",
  storageBucket: "student-reminder-c5438.firebasestorage.app",
  messagingSenderId: "540973913270",
  appId: "1:540973913270:web:c0f053cf8a014de85e8217",
  measurementId: "G-T9WEM62GXJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
