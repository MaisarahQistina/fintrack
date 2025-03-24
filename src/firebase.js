import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAN6wSkZNcJz4WQclu6_tYZLLybv1FwcFQ",
  authDomain: "fintrack-7752a.firebaseapp.com",
  projectId: "fintrack-7752a",
  storageBucket: "fintrack-7752a.firebasestorage.app",
  messagingSenderId: "885847021654",
  appId: "1:885847021654:web:e9fb277709ab2d074a43f7",
  measurementId: "G-H63GX49LE5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;