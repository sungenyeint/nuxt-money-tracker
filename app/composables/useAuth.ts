import { ref } from "vue"
import { auth, googleProvider } from "~/composables/useFirebase"
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth"

const user = ref<any>(null)
let initialized = false

function initAuthListener() {
  if (!initialized) {
    onAuthStateChanged(auth, (u) => {
      user.value = u
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

  return { user, signout, signin, signUpWithEmail, signInWithGoogle }
}
