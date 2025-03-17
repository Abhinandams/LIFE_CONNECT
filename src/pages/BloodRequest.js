import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/BloodRequest.css";

const BloodRequest = () => {
  const [formData, setFormData] = useState({ location: "", bloodGroup: "", units: "", date: "" });
  const [userEmail, setUserEmail] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const bloodCompatibility = {
    "A+": ["A+", "A-", "O+", "O-"], "A-": ["A-", "O-"], "B+": ["B+", "B-", "O+", "O-"],
    "B-": ["B-", "O-"], "AB+": ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    "AB-": ["A-", "B-", "O-", "AB-"], "O+": ["O+", "O-"], "O-": ["O-"]
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserEmail(user.email);
      } else {
        navigate("/auth");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return alert("Please log in to submit a request.");
  
    try {
      const docRef = await addDoc(collection(db, "bloodRequests"), {
        location: formData.location,
        bloodGroup: formData.bloodGroup,
        units: formData.units,
        date: formData.date,
        email: auth.currentUser.email,
        timestamp: serverTimestamp(), // Ensuring timestamp is correctly stored
      });
  
      console.log("Document written with ID: ", docRef.id);
      alert("Blood request submitted successfully!");
  
      // Reset the form after submission
      setFormData({ location: "", bloodGroup: "", units: "", date: "" });
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Error submitting request.");
    }
  };
  

  const handleProfileClick = () => setShowDropdown(!showDropdown);

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

      <h2>Blood Request</h2>
      <form onSubmit={handleSubmit}>
        <label>Location:</label>
        <input type="text" name="location" value={formData.location} onChange={handleChange} required />

        <label>Blood Group:</label>
        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
          <option value="">Select Blood Group</option>
          {Object.keys(bloodCompatibility).map(group => (
            <option key={group} value={group}>{group}</option>
          ))}
        </select>

        <label>Units Required:</label>
        <input type="number" name="units" value={formData.units} onChange={handleChange} min="1" required />

        <label>Required Date:</label>
        <input type="date" name="date" value={formData.date} onChange={handleChange} required />

        <button type="submit">Submit Request</button>
      </form>

      {formData.bloodGroup && (
        <div>
          <h3>Compatible Donors for {formData.bloodGroup}</h3>
          <p>{bloodCompatibility[formData.bloodGroup].join(", ")}</p>
        </div>
      )}
    </div>
  );
};

export default BloodRequest;
