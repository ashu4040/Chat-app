import React, { useContext, useEffect, useState } from "react";
import "./ProfileUpdate.css";
import assets from "../../assets/assets";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/Firebase";
import { getDoc, updateDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Upload from "../../lib/Upload";
import { AppContext } from "../../context/AppContext";

const ProfileUpdate = () => {
  const [img, setImg] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState("");
  const [prevImage, setPrevImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const { setUserData } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setName(userData.name || "");
          setBio(userData.bio || "");
          setPrevImage(userData.avatar || "");
        }
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [navigate]);

  useEffect(() => {
    if (img) {
      setImagePreview(URL.createObjectURL(img));
    }
  }, [img]);

  const profileDetails = async (e) => {
    e.preventDefault();

    try {
      if (!prevImage && !img) {
        toast.error("Upload profile picture");
        return;
      }

      const docRef = doc(db, "users", uid);
      let imageUrl = prevImage;

      if (img) {
        imageUrl = await Upload(img);
      }

      await updateDoc(docRef, {
        avatar: imageUrl,
        bio: bio,
        name: name,
      });

      setTimeout(async () => {
        const snap = await getDoc(docRef);
        setUserData(snap.data());
        navigate("/chat");
      }, 1000);

      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="profile">
      <div className="profile-container">
        <form onSubmit={profileDetails}>
          <h3>Profile Details</h3>
          <label htmlFor="avatar">
            <input
              type="file"
              accept=".png, .jpg, .jpeg"
              hidden
              id="avatar"
              onChange={(e) => {
                if (e.target.files.length > 0) {
                  setImg(e.target.files[0]);
                  e.target.value = "";
                }
              }}
            />
            <img
              src={imagePreview || prevImage || assets.avatar_icon}
              alt="Avatar"
            />
            Upload profile image
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write profile bio"
          ></textarea>
          <button type="submit">Save</button>
        </form>
        <img
          src={imagePreview || prevImage || assets.logo_icon}
          className="profile-pic"
          alt="Profile"
        />
      </div>
    </div>
  );
};

export default ProfileUpdate;
