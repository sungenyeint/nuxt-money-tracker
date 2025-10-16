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
  onAuthStateChanged(
    $auth,
    (firebaseUser) => {
      user.value = firebaseUser;
      authLoading.value = false;
    },
    (err) => {
      console.error('Auth state change error:', err);
      user.value = null;
      authLoading.value = false;
    }
  );

  // Register new user
  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const res = await createUserWithEmailAndPassword($auth, email, password);
      user.value = res.user;
      return res.user;
    } catch (err) {
      console.error('signUpWithEmail error:', err);
      throw err;
    }
  };

  // Login user
  const signin = async (email: string, password: string) => {
    try {
      const res = await signInWithEmailAndPassword($auth, email, password);
      user.value = res.user;
      return res.user;
    } catch (err) {
      console.error('signin error:', err);
      throw err;
    }
  };

  // Login with Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup($auth, provider);
      user.value = res.user;
      return res.user;
    } catch (err) {
      console.error('signInWithGoogle error:', err);
      throw err;
    }
  };

  // Logout
  const signout = async () => {
    try {
      await signOut($auth);
      user.value = null;
    } catch (err) {
      console.error('signout error:', err);
      throw err;
    }
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
