import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate("/auth");
      return;
    }
    setUserEmail(user?.email || "No email available");
  }, [navigate]);

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
      <div className="home-card relative">
        {/* Profile Button */}
        <button 
          className="absolute top-4 right-4 text-red-500 font-bold"
          onClick={handleProfileClick}
        >
          👤 Profile
        </button>

        {/* Profile Dropdown */}
        {showDropdown && (
          <div className="absolute top-14 right-4 bg-white border rounded shadow-lg p-4 z-10">
            <p className="text-gray-700 mb-2">{userEmail}</p>
            <button 
              onClick={handleLogout} 
              className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        )}

        {/* Profile Icon */}
        <div className="profile-icon mb-4 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="purple">
            <path d="M12 2a10 10 0 0 0-7.74 16.23l.02.01A9.98 9.98 0 0 0 12 22a9.98 9.98 0 0 0 7.72-3.76l.02-.01A10 10 0 0 0 12 2zm0 18a8 8 0 0 1-5.55-2.25 6 6 0 0 1 11.1 0A8 8 0 0 1 12 20zm0-10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
          </svg>
        </div>

        {/* Logo */}
        <div className="logo mb-4 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="red">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>

        {/* Title and Subtitle */}
        <h2 className="text-center text-2xl font-bold text-red-600 mb-2">
          Life Connect
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Your Intelligent Emergency Response System
        </p>

        {/* Navigation Buttons */}
        <div className="space-y-4">
          <Link 
            to="/accident-reporting" 
            className="w-full py-3 bg-blue-500 text-white rounded-lg flex items-center justify-center"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              className="mr-2"
            >
              <path d="M16 18a4 4 0 0 0-8 0"></path>
              <circle cx="12" cy="11" r="3"></circle>
              <path d="M20 20.7c.4-2.6-1.5-4.7-4.1-4.7h-4.8c-2.6 0-4.5 2.1-4.1 4.7"></path>
            </svg>
            Report an Accident
          </Link>
          
          <Link 
            to="/blood-module" 
            className="w-full py-3 bg-green-500 text-white rounded-lg flex items-center justify-center"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              className="mr-2"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
              <path d="M12 7v5"></path>
              <path d="M9.5 9.5h5"></path>
            </svg>
            Find Blood Donors
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;