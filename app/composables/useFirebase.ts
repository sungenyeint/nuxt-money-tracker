import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDpf3Hv-97gtGvbyCHmBldqQCq1ycpAotw",
  authDomain: "moneytracker-63654.firebaseapp.com",
  projectId: "moneytracker-63654",
  storageBucket: "moneytracker-63654.firebasestorage.app",
  messagingSenderId: "532726852746",
  appId: "1:532726852746:web:f75109bb7aa17d7f259173",
  measurementId: "G-KTG7S29ZXW"
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

export async function login() {
  return await signInWithPopup(auth, googleProvider)
}

export async function logout() {
  return await signOut(auth)
}
