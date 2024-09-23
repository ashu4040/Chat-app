import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  setDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: "AIzaSyDUKxRxORIE6NQpLQVJ2HWsP02_yB9jYyc",
  authDomain: "chat-app-51d9a.firebaseapp.com",
  projectId: "chat-app-51d9a",
  storageBucket: "chat-app-51d9a.appspot.com",
  messagingSenderId: "481223205102",
  appId: "1:481223205102:web:11e5417bcfb2ed2121d3ff",
  measurementId: "G-4321S9MB5Q",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (username, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio: "Hey, There i am using chat app",
      lastSeen: Date.now(),
    });
    await setDoc(doc(db, "chats", user.uid), {
      chatsData: [],
    });
  } catch (error) {
    toast.error(error.code.split("/")[1].split("-").join(" "));
  }
};

const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    toast.error(error.code.split("/")[1].split("-").join(" "));
  }
};

const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    toast.error(error.code.split("/")[1].split("-").join(" "));
  }
};

const resetPass = async (email) => {
  if (!email) {
    toast.error("Enter your email");
    return null;
  }
  try {
    const userRef = collection(db, "users");
    const q = query(userRef, where("email", "==", email));
    const querrySnap = await getDocs(q);
    if (!querrySnap.empty) {
      await sendPasswordResetEmail(auth, email);
      toast.success("Reset Email Sent");
    } else {
      toast.error("Email dosn't exists");
    }
  } catch (error) {
    toast.error(error.message);
  }
};

export { signup, login, logOut, auth, db, resetPass };
