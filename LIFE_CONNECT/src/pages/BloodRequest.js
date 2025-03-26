import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/BloodRequest.css";

import axios from "axios";

const sendSOS = async (donor) => {
  try {
    await addDoc(collection(db, "bloodRequests"), {
      donorId: donor.id,
      donorName: donor.name,
      contact: donor.contact,
      bloodGroup: donor.bloodGroup,
      location: donor.location,
      status: "pending",
      timestamp: serverTimestamp(),
    });

    // Call backend API to send SMS
    await axios.post("http://localhost:5000/send-sms", {
      to: donor.contact,
      message: `Urgent! A blood request for ${donor.bloodGroup} is needed at ${donor.location}. Please contact immediately.`,
    });

    alert(`SOS sent to ${donor.name}!`);
  } catch (error) {
    console.error("Error sending SOS:", error);
    alert("Failed to send SOS.");
  }
};


const BloodRequest = () => {
  const [formData, setFormData] = useState({ location: "", bloodGroup: "", units: "", date: "" });
  const [userEmail, setUserEmail] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [matchingDonors, setMatchingDonors] = useState([]);
  const [allDonors, setAllDonors] = useState([]);
  const [acceptedDonors, setAcceptedDonors] = useState([]); // ✅ Fixed undefined error
  const [loading, setLoading] = useState(false);
  const [sosRequests, setSosRequests] = useState([]);

  const navigate = useNavigate();

  const bloodCompatibility = {
    "A+": ["A+", "A-", "O+", "O-"], "A-": ["A-", "O-"], "B+": ["B+", "B-", "O+", "O-"],
    "B-": ["B-", "O-"], "AB+": ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    "AB-": ["A-", "B-", "O-", "AB-"], "O+": ["O+", "O-"], "O-": ["O-"]
  };
  
  useEffect(() => {
    const fetchAllDonors = async () => {
      try {
        const donorsSnapshot = await getDocs(collection(db, "bloodDonors"));
        const donorsList = donorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllDonors(donorsList);
        console.log("All donors fetched:", donorsList);
      } catch (error) {
        console.error("Error fetching donors:", error);
      }
    };

    fetchAllDonors();
  }, []);

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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "bloodGroup" || name === "location") {
      findCompatibleDonors(name === "bloodGroup" ? value : formData.bloodGroup, name === "location" ? value : formData.location);
    }
  };

  const findCompatibleDonors = (bloodGroup, location) => {
    setLoading(true);
    
    try {
      let filteredDonors = [...allDonors

      ];

      if (bloodGroup) {
        const compatibleGroups = bloodCompatibility[bloodGroup] || [];
        filteredDonors = filteredDonors.filter(donor => compatibleGroups.includes(donor.bloodGroup));
      }

      if (location && location.trim() !== "") {
        const locationLower = location.toLowerCase().trim();
        filteredDonors = filteredDonors.filter(donor => donor.location?.toLowerCase().includes(locationLower));
      }

      setMatchingDonors(filteredDonors);
    } catch (error) {
      console.error("Error finding compatible donors:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendSOS = async (donor) => {
    try {
      await addDoc(collection(db, "bloodRequests"), {
        donorId: donor.id,
        donorName: donor.name,
        contact: donor.contact,
        bloodGroup: donor.bloodGroup,
        location: donor.location,
        status: "pending",
        timestamp: serverTimestamp(),
      });

      const response = await axios.post('http://localhost:5000/send_blood_request', {
        name: donor.name,
        phone: donor.contact,
        blood_group: donor.bloodGroup,
        location: donor.location
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log(response)

      alert(`SOS sent to ${donor.name}!`);
    } catch (error) {
      console.error("Error sending SOS:", error);
      alert("Failed to send SOS.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return alert("Please log in to submit a request.");

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "bloodRequests"), {
        ...formData,
        email: auth.currentUser.email,
        timestamp: serverTimestamp(),
      });

      alert("Blood request submitted successfully!");
      findCompatibleDonors(formData.bloodGroup, formData.location);
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Error submitting request: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAcceptedDonors = async () => {
      try {
        const q = query(collection(db, "bloodRequests"), where("status", "==", "Accepted"));
        const querySnapshot = await getDocs(q);
        setAcceptedDonors(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching accepted donors:", error);
      }
    };

    fetchAcceptedDonors();
  }, []);

  useEffect(() => {
    const fetchSosRequests = async () => {
      try {
        const q = query(collection(db, "bloodRequests"), where("status", "==", "pending"));
        const querySnapshot = await getDocs(q);
        setSosRequests(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching SOS requests:", error);
      }
    };

    fetchSosRequests();
  }, []);

  const respondToSOS = async (requestId, response) => {
    try {
      await updateDoc(doc(db, "bloodRequests", requestId), { status: response });
      alert(`You have ${response.toLowerCase()}ed the SOS request.`);
      setSosRequests(sosRequests.filter(req => req.id !== requestId));
    } catch (error) {
      console.error("Error responding to SOS:", error);
    }
  };

  return (
    <div className="container">
      <div className="profile-section">
        <button className="home-button profile-btn" onClick={() => setShowDropdown(!showDropdown)}>👤 Profile</button>
        {showDropdown && (
          <div className="dropdown">
            <p>{userEmail}</p>
            <button onClick={() => auth.signOut().then(() => navigate('/auth'))}>Logout</button>
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
          {Object.keys(bloodCompatibility).map(group => <option key={group} value={group}>{group}</option>)}
        </select>

        <label>Units Required:</label>
        <input type="number" name="units" value={formData.units} onChange={handleChange} min="1" required />

        <label>Required Date:</label>
        <input type="date" name="date" value={formData.date} onChange={handleChange} required />

        <button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit Request"}</button>
      </form>

      <h3>Matching Donors</h3>
      {matchingDonors.map(donor => (
        <div key={donor.id} className="donor-card">
          <p>Name: {donor.name}</p>
          <p>Blood Group: {donor.bloodGroup}</p>
          <p>Location: {donor.location}</p>
          <p>Contact: {donor.contact}</p>
          <button onClick={() => sendSOS(donor)}>Send SOS</button>
        </div>
      ))}
    </div>
  );
};

export default BloodRequest;
