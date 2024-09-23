import { createContext, useEffect, useState } from "react";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../config/Firebase";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/Firebase";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const [userData, setUserData] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [messagesId, setmessagesId] = useState(null);
  const [messages, setmessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [chatVisible, setChatVisible] = useState(false);
  const navigate = useNavigate();

  const loadUserDataValue = async (uid) => {
    try {
      const useRef = doc(db, "users", uid);
      const userSnap = await getDoc(useRef);
      const userData = userSnap.data();
      setUserData(userData);
      if (userData.name && userData.avatar) {
        navigate("/chat");
      } else {
        navigate("/profile");
      }
      await updateDoc(useRef, {
        lastSeen: Date.now(),
      });

      setInterval(async () => {
        if (auth.chatUser) {
          await updateDoc(useRef, {
            lastSeen: Date.now(),
          });
        }
      }, 60000);
    } catch {}
  };

  useEffect(() => {
    if (userData) {
      const chatRef = doc(db, "chats", userData.id);
      const unSub = onSnapshot(chatRef, async (res) => {
        const chatItems = res.data().chatsData;
        const tempData = [];
        for (const item of chatItems) {
          const userRef = doc(db, "users", item.rId);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.data();
          tempData.push({ ...item, userData });
        }
        setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
      });
      return () => {
        unSub();
      };
    }
  }, [userData]);

  const value = {
    userData,
    setUserData,
    chatData,
    setChatData,
    messages,
    setmessages,
    messagesId,
    setmessagesId,
    chatUser,
    setChatUser,
    loadUserDataValue,
    chatVisible,
    setChatVisible,
  };
  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
