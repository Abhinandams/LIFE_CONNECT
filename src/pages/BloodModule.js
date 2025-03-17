import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const BloodModule = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // Fetch user email from Firebase Auth
    const user = auth.currentUser;
    setUserEmail(user?.email || "No email available");
  }, []);

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="container">
      <div className="profile-section">
        <button className="home-button profile-btn" onClick={handleProfileClick}>
          👤 Profile
        </button>

        {showDropdown && (
          <div className="dropdown">
            <p>{userEmail}</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
      <h2>Blood Module</h2>
      <button onClick={() => navigate("/blood-request")}>Request Blood</button>
      <button onClick={() => navigate("/blood-donor-registration")}>Become a Donor</button>
    </div>
  );
};

export default BloodModule;
