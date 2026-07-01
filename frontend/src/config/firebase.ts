import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB1P2VBP82rZ3y3pJqzeQsGE_Hl9sVbdfc",
  authDomain: "crackprep-webapp.firebaseapp.com",
  projectId: "crackprep-webapp",
  storageBucket: "crackprep-webapp.firebasestorage.app",
  messagingSenderId: "1060022259206",
  appId: "1:1060022259206:web:760e6130a83940aeb2bd87",
  measurementId: "G-27NGQ7R3LH"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
