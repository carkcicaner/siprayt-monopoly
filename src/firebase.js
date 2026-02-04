import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBrYALtfdsZT4-hYaYxqfJ2x1wVF_6vWGM",
  authDomain: "siprayt-monopoly.firebaseapp.com",
  projectId: "siprayt-monopoly",
  storageBucket: "siprayt-monopoly.firebasestorage.app",
  messagingSenderId: "219751868418",
  appId: "1:219751868418:web:f6e1d33b23ab4f2b789f1b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);