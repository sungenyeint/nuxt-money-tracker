import { getAuth, onAuthStateChanged } from 'firebase/auth'

export default defineNuxtPlugin((nuxtApp) => {
  const auth = getAuth()
  const { user } = useAuth()

  onAuthStateChanged(auth, (firebaseUser) => {
    user.value = firebaseUser
  })
  console.log('Firebase auth listener initialized.', user.value);
})
