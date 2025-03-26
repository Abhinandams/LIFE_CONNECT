import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase"; // Ensure correct path
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    setUserEmail(user?.email || "No email available");
  }, []);

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="home-container">
      {/* Profile Button */}
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

      {/* Hero Section */}
      <header className="hero-section">
        <h1>Welcome to LifeConnect</h1>
        <p>Your Intelligent Emergency Response System</p>
      </header>

      {/* Navigation Buttons */}
      <div className="buttons-container">
        <Link to="/accident-reporting" className="home-button accident-btn">
          🚑 Report an Accident
        </Link>
        <Link to="/blood-module" className="home-button blood-btn">
          💉 Find Blood Donors
        </Link>
      </div>
    </div>
  );
};

export default Home;
