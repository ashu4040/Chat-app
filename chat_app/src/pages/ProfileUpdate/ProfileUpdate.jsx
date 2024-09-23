import React, { useContext, useEffect, useState } from "react";
import "./ProfileUpdate.css";
import assets from "../../assets/assets";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/Firebase";
import { getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { doc } from "firebase/firestore";
import { toast } from "react-toastify";
import Upload from "../../lib/Upload";
import { AppContext } from "../../context/AppContext";

const ProfileUpdate = () => {
  const [img, setimg] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState("");
  const [prevImage, setPrivImage] = useState("");
  const { setUserData } = useContext(AppContext);
  const navigate = useNavigate();

  const profileDetails = async (e) => {
    e.preventDefault();
    try {
      if (!prevImage && !img) {
        toast.error("upload profile picture");
      }
      const docRef = doc(db, "users", uid);
      if (img) {
        const imageUrl = await Upload(img);
        setPrivImage(imageUrl);
        await updateDoc(docRef, {
          avatar: imageUrl,
          bio: bio,
          name: name,
        });
      } else {
        await updateDoc(docRef, {
          bio: bio,
          name: name,
        });
      }
      const snap = await getDoc(docRef);
      setUserData(snap.data());
      navigate("/chat");
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.data().name) {
          setName(docSnap.data().name);
        }
        if (docSnap.data().bio) {
          setBio(docSnap.data().bio);
        }
        if (docSnap.data().avatar) {
          setPrivImage(docSnap.data().avatar);
        }
      } else {
        navigate("/");
      }
    });
  }, []);
  return (
    <div className="profile">
      <div className="profile-container">
        <form onSubmit={profileDetails}>
          <h3>Profile Details</h3>
          <label htmlFor="avatar">
            <input
              onChange={(e) => setimg(e.target.files[0])}
              type="file"
              name=""
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <img
              src={img ? URL.createObjectURL(img) : assets.avatar_icon}
              alt=""
            />
            upload profile image
          </label>
          <input
            type="text"
            onChange={(e) => setName(e.target.value)}
            value={name}
            name=""
            placeholder="Your name"
            id=""
          />
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write profile bio"
          ></textarea>
          <button type="sumbit">save</button>
        </form>
        <img
          src={
            img
              ? URL.createObjectURL(img)
              : prevImage
              ? prevImage
              : assets.logo_icon
          }
          className="profile-pic"
          alt=""
        />
      </div>
    </div>
  );
};

export default ProfileUpdate;
