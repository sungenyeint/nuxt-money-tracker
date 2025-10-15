import { useNuxtApp } from "#app";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type User,
  type Auth,
} from "firebase/auth";

export function useAuth() {
  const nuxtApp = useNuxtApp();
  const user = useState<User | null>("user", () => null);
  const authLoading = useState<boolean>("authLoading", () => true);

  // Get Firebase auth instance with error handling
  const $auth = nuxtApp.$auth as Auth | undefined;

  if (!$auth) {
    console.error('Firebase auth is not initialized. Make sure the Firebase plugin is properly configured.');
    return {
      user,
      authLoading,
      signUpWithEmail: () => Promise.reject(new Error('Firebase auth not initialized')),
      signin: () => Promise.reject(new Error('Firebase auth not initialized')),
      signInWithGoogle: () => Promise.reject(new Error('Firebase auth not initialized')),
      signout: () => Promise.reject(new Error('Firebase auth not initialized')),
    };
  }

  // Initialize auth state listener
  onAuthStateChanged($auth, (firebaseUser) => {
    user.value = firebaseUser;
    authLoading.value = false;
  });

  // Register new user
  const signUpWithEmail = async (email: string, password: string) => {
    const res = await createUserWithEmailAndPassword($auth, email, password);
    user.value = res.user;
  };

  // Login user
  const signin = async (email: string, password: string) => {
    const res = await signInWithEmailAndPassword($auth, email, password);
    user.value = res.user;
  };

  // Login with Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const res = await signInWithPopup($auth, provider);
    user.value = res.user;
  };

  // Logout
  const signout = async () => {
    await signOut($auth);
    user.value = null;
  };

  return {
    user,
    authLoading,
    signUpWithEmail,
    signin,
    signInWithGoogle,
    signout
  };
}
