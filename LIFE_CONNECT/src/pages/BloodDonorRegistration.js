import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { db, auth } from "../firebase"; // Ensure auth is imported
import { collection, addDoc ,serverTimestamp} from "firebase/firestore";
import "../styles/BloodDonorRegistration.css";

const BloodDonorRegistration = () => {
  const navigate = useNavigate(); // Define navigate
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    bloodGroup: "",
    contact: "",
    location: "",
  });

  const [showDropdown, setShowDropdown] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    setUserEmail(user?.email || "No email available");
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await addDoc(collection(db, "bloodDonors"), {
      ...formData,
      timestamp: serverTimestamp(), // Add Firestore server timestamp
    });

    alert("Donor registered successfully!");
    setFormData({ name: "", age: "", bloodGroup: "", contact: "", location: "" });
  } catch (error) {
    console.error("Error registering donor:", error);
    alert("Error registering donor.");
  }
};


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
    <div className="blood-donor-container">
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
      <h2>Blood Donor Registration</h2>
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />

        <label>Age:</label>
        <input type="number" name="age" value={formData.age} onChange={handleChange} required />

        <label>Blood Group:</label>
        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
          <option value="">Select Blood Group</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>

        <label>Contact Number:</label>
        <input type="text" name="contact" value={formData.contact} onChange={handleChange} required />

        <label>Location:</label>
        <input type="text" name="location" value={formData.location} onChange={handleChange} required />

        <button type="submit">Register as Donor</button>
      </form>
    </div>
  );
};

export default BloodDonorRegistration;
