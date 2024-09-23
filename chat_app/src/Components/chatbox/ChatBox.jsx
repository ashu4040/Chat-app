import React, { useContext, useEffect } from "react";
import "./ChatBox.css";
import assets from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import { useState } from "react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/Firebase";
import Upload from "../../lib/Upload";
import { toast } from "react-toastify";

const ChatBox = () => {
  const {
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
  } = useContext(AppContext);

  const [input, setInput] = useState("");

  const sendMessage = async () => {
    try {
      if (input && messagesId) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: new Date(),
          }),
        });

        const userIds = [chatUser.rId, userData.id];
        userIds.forEach(async (id) => {
          const userChatsRef = doc(db, "chats", id);
          const userChatsSnapshot = await getDoc(userChatsRef);
          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex(
              (c) => c.messageId === messagesId
            );
            userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatsData[chatIndex].rId == userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }
            await updateDoc(userChatsRef, {
              chatsData: userChatData.chatsData,
            });
          }
        });
      }
    } catch (error) {
      console.error(error.message);
    }
    setInput("");
  };

  const sendImage = async (e) => {
    try {
      const fileUrl = await Upload(e.target.files[0]);
      if (fileUrl && messagesId) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            image: fileUrl,
            createdAt: new Date(),
          }),
        });
      }

      const userIds = [chatUser.rId, userData.id];
      userIds.forEach(async (id) => {
        const userChatsRef = doc(db, "chats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);
        if (userChatsSnapshot.exists()) {
          const userChatData = userChatsSnapshot.data();
          const chatIndex = userChatData.chatsData.findIndex(
            (c) => c.messageId === messagesId
          );
          userChatData.chatsData[chatIndex].lastMessage = "image";
          userChatData.chatsData[chatIndex].updatedAt = Date.now();
          if (userChatData.chatsData[chatIndex].rId == userData.id) {
            userChatData.chatsData[chatIndex].messageSeen = false;
          }
          await updateDoc(userChatsRef, {
            chatsData: userChatData.chatsData,
          });
        }
      });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const convertTimestamp = (timestamp) => {
    let date = timestamp.toDate();
    const hour = date.getHours();
    const minutes = date.getMinutes();
    if (hour > 12) {
      return hour - 12 + ":" + minutes + "PM";
    } else {
      return hour + ":" + minutes + "AM";
    }
  };

  useEffect(() => {
    if (messagesId) {
      const unsub = onSnapshot(doc(db, "messages", messagesId), (res) => {
        setmessages(res.data().messages.reverse());
      });
      return () => {
        unsub();
      };
    }
  }, [messagesId]);

  return chatUser ? (
    <div className={`chat-box ${chatVisible ? "" : "hidden"}`}>
      <div className="chat-user">
        <img src={chatUser.userData.avatar} alt="" />
        <p>
          {chatUser.userData.name}
          {Date.now() - chatUser.userData.lastSeen <= 70000 ? (
            <img className="dot" src={assets.green_dot} alt="" />
          ) : null}
        </p>
        <img src={assets.help_icon} className="help" alt="" />
        <img
          onClick={() => setChatVisible(false)}
          src={assets.arrow_icon}
          className="arrow"
          alt=""
        />
      </div>

      <div className="chat-message">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.sId === userData.id ? "s-message" : "r-message"}
          >
            {msg["image"] ? (
              <img className="message-img" src={msg.image} alt="" />
            ) : (
              <p className="message">{msg.text}</p>
            )}
            <div>
              <img
                src={
                  msg.sId === userData.id
                    ? userData.avatar
                    : chatUser.userData.avatar
                }
                alt="Avatar"
              />
              <p>{convertTimestamp(msg.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          name=""
          placeholder="Send a message"
          id=""
        />
        <input
          onChange={sendImage}
          type="file"
          name=""
          id="image"
          accept="image/png, image/jpeg"
          hidden
        />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="" />
      </div>
    </div>
  ) : (
    <div className={`chat-box ${chatVisible ? "" : "hidden"}`}>
      <img src={assets.logo_icon} alt="" />
      <p>Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatBox;
