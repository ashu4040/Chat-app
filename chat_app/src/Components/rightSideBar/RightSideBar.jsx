import React, { useContext, useEffect, useState } from "react";
import "./RightSideBar.css";
import assets from "../../assets/assets";
import { logOut } from "../../config/Firebase";
import { AppContext } from "../../context/AppContext";
const RightSideBar = () => {
  const { chatUser, messages } = useContext(AppContext);

  const [msgImg, setMsgImg] = useState([]);
  useEffect(() => {
    let tempVar = [];
    messages.map((msg) => {
      if (msg.image) {
        tempVar.push(msg.image);
      }
    });
    setMsgImg(tempVar);
  }, [messages]);
  return chatUser ? (
    <div className="rs">
      <div className="rs-profile">
        <img src={chatUser.userData.avatar} alt="" />
        <h3>
          {Date.now() - chatUser.userData.lastSeen <= 70000 ? (
            <img src={assets.green_dot} className="dot" alt="" />
          ) : null}{" "}
          {chatUser.userData.name}{" "}
        </h3>
        <p>{chatUser.userData.bio}</p>
      </div>
      <hr />
      <div className="rs-media">
        <p>Media</p>
        <div>
          {msgImg.map((url, index) => (
            <img
              onClick={() => window.open(url)}
              key={index}
              src={url}
              alt=""
            />
          ))}
        </div>
      </div>
      <button onClick={() => logOut()}>LogOut</button>
    </div>
  ) : (
    <div className="rs">
      <button onClick={() => logOut()}>Logout</button>
    </div>
  );
};

export default RightSideBar;
