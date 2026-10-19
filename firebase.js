import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPEoYYsxBNtAV1cvLmOh0B9QradnrFcnc",
  authDomain: "mapnotes-97c04.firebaseapp.com",
  projectId: "mapnotes-97c04",
  storageBucket: "mapnotes-97c04.firebasestorage.app",
  messagingSenderId: "367234838521",
  appId: "1:367234838521:web:96e27efc68f781a4861728"
};


// Initialiserer Firebase
const app = initializeApp(firebaseConfig);

// Opretter forbindelse til Firestore
const db = getFirestore(app);

// Initialiserer Authentication med lokal brugerlagring
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Eksporterer Firebase, Firestore og Authentication
export { app, db, auth };
