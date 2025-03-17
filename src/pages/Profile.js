import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [userEmail, setUserEmail] = useState(""); // ✅ Store user email
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUserEmail(currentUser.email); // ✅ Get and store email
      } else {
        navigate("/auth"); // Redirect if not logged in
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="profile-container">
      <h2>👤 User Profile</h2>

      {userEmail ? ( // ✅ Display email once it's available
        <p><strong>Email:</strong> {userEmail}</p>
      ) : (
        <p>Fetching email...</p> // ✅ Temporary message while loading
      )}

      <button onClick={() => auth.signOut().then(() => navigate("/auth"))}>
        Logout
      </button>
    </div>
  );
};

export default Profile;
