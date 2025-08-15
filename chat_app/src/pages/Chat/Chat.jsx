import React, { useContext, useEffect, useState } from "react";
import "./Chat.css";
import LeftsideBar from "../../Components/leftSideBar/LeftsideBar";
import RightSideBar from "../../Components/rightSideBar/RightSideBar";
import ChatBox from "../../Components/chatbox/ChatBox";
import { AppContext } from "../../context/AppContext";

const Chat = () => {
  const { chatData, userData, setChatUser } = useContext(AppContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (chatData && userData) {
      setLoading(false);

      // ✅ Auto-select admin chat
      const adminChat = chatData.find(
        (chat) => chat.userData?.name?.toLowerCase() === "admin"
      );

      if (adminChat) {
        setChatUser(adminChat.userData);
      }
    } else {
      setLoading(true);
    }
  }, [chatData, userData, setChatUser]);

  return (
    <div className="chat">
      {loading ? (
        <p className="loading">Loading...</p>
      ) : (
        <div className="chat-container">
          <LeftsideBar />
          <ChatBox />
          <RightSideBar />
        </div>
      )}
    </div>
  );
};

export default Chat;
