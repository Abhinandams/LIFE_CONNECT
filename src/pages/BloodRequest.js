import React, { useState } from "react";
import { db, auth } from "../firebase"; // Import Firebase Firestore and Auth
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import "../styles/BloodRequest.css";

const BloodRequest = () => {
  const [formData, setFormData] = useState({
    location: "",
    bloodGroup: "",
    units: "",
    date: "",
  });

  const bloodCompatibility = {
    "A+": ["A+", "A-", "O+", "O-"],
    "A-": ["A-", "O-"],
    "B+": ["B+", "B-", "O+", "O-"],
    "B-": ["B-", "O-"],
    "AB+": ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    "AB-": ["A-", "B-", "O-", "AB-"],
    "O+": ["O+", "O-"],
    "O-": ["O-"],
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = auth.currentUser; // Get logged-in user
      if (!user) {
        alert("Please log in to submit a blood request.");
        return;
      }

      const requestData = {
        ...formData,
        email: user.email, // Include user email
        timestamp: serverTimestamp(), // Store submission time
      };

      await addDoc(collection(db, "bloodRequests"), requestData);
      alert("Blood request submitted successfully!");

      setFormData({ location: "", bloodGroup: "", units: "", date: "" });
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Error submitting request.");
    }
  };

  return (
    <div className="container">
      <h2>Blood Request</h2>
      <form onSubmit={handleSubmit}>
        <label>Location:</label>
        <input type="text" name="location" value={formData.location} onChange={handleChange} required />

        <label>Blood Group:</label>
        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
          <option value="">Select Blood Group</option>
          {Object.keys(bloodCompatibility).map((group) => (
            <option key={group} value={group}>{group}</option>
          ))}
        </select>

        <label>Units Required:</label>
        <input type="number" name="units" value={formData.units} onChange={handleChange} required />

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