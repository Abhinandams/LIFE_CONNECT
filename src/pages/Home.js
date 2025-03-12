import React from "react";
import { Link } from "react-router-dom";
import './Home.css';  // ✅ Correct path
 // Importing styles

const Home = () => {
  return (
    <div className="home-container">
      <header className="hero-section">
        <h1>Welcome to LifeConnect</h1>
        <p>Your Intelligent Emergency Response System</p>
      </header>

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