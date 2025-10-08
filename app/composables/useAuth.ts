import { ref } from "vue"
import { auth, googleProvider } from "~/composables/useFirebase"
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth"

const user = ref<any>(null)
const authLoading = ref(true)
let initialized = false

function initAuthListener() {
  if (!initialized) {
    onAuthStateChanged(auth, (u) => {
      user.value = u
      authLoading.value = false
    })
    initialized = true
  }
}

export function useAuth() {
  initAuthListener()

  const signout = async () => {
    await signOut(auth)
    user.value = null
  }

  const signin = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      user.value = result.user
      return result.user
    } catch (error) {
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      user.value = result.user
      return result.user
    } catch (error) {
      throw error
    }
  }

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      user.value = result.user
      return result.user
    } catch (error) {
      throw error
    }
  }

  return { user, authLoading, signout, signin, signUpWithEmail, signInWithGoogle }
}
