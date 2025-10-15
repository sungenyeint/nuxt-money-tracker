import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
//   const config = useRuntimeConfig()

export const useFirebase = () => {
  //   const firebaseConfig = config.public.firebase

  const firebaseConfig = {
    apiKey: "AIzaSyDpf3Hv-97gtGvbyCHmBldqQCq1ycpAotw",
    authDomain: "moneytracker-63654.firebaseapp.com",
    projectId: "moneytracker-63654",
    storageBucket: "moneytracker-63654.firebasestorage.app",
    messagingSenderId: "532726852746",
    appId: "1:532726852746:web:f75109bb7aa17d7f259173",
    measurementId: "G-KTG7S29ZXW",
  };

  const app = initializeApp(firebaseConfig);

  const auth = getAuth(app);
  const db = getFirestore(app);
  const googleProvider = new GoogleAuthProvider();

  return { app, auth, db, googleProvider };
};
