import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/BloodRequest.css";

const BloodRequest = () => {
  const [formData, setFormData] = useState({ location: "", bloodGroup: "", units: "", date: "" });
  const [userEmail, setUserEmail] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [matchingDonors, setMatchingDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allDonors, setAllDonors] = useState([]);
  const navigate = useNavigate();

  const bloodCompatibility = {
    "A+": ["A+", "A-", "O+", "O-"], "A-": ["A-", "O-"], "B+": ["B+", "B-", "O+", "O-"],
    "B-": ["B-", "O-"], "AB+": ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    "AB-": ["A-", "B-", "O-", "AB-"], "O+": ["O+", "O-"], "O-": ["O-"]
  };

  // Fetch all donors when component mounts
  useEffect(() => {
    const fetchAllDonors = async () => {
      try {
        const donorsSnapshot = await getDocs(collection(db, "bloodDonors"));
        const donorsList = [];
        donorsSnapshot.forEach((doc) => {
          donorsList.push({ id: doc.id, ...doc.data() });
        });
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // If bloodGroup changes, filter donors automatically
    if (e.target.name === "bloodGroup") {
      findCompatibleDonors(e.target.value, formData.location);
    } else if (e.target.name === "location" && formData.bloodGroup) {
      findCompatibleDonors(formData.bloodGroup, e.target.value);
    }
  };

  // Function to find compatible donors
  const findCompatibleDonors = (requestBloodGroup, requestLocation) => {
    setLoading(true);
    
    try {
      if (!requestBloodGroup) {
        setMatchingDonors([]);
        return;
      }
      
      const compatibleGroups = bloodCompatibility[requestBloodGroup] || [];
      console.log("Compatible blood groups:", compatibleGroups);
      console.log("Searching in location:", requestLocation);
      console.log("Total donors to filter:", allDonors.length);
      
      let filteredDonors = [...allDonors];
      
      // Filter by compatible blood groups
      if (compatibleGroups.length > 0) {
        filteredDonors = filteredDonors.filter(donor => 
          compatibleGroups.includes(donor.bloodGroup)
        );
      }
      
      // Filter by location if provided
      if (requestLocation && requestLocation.trim() !== "") {
        const locationLower = requestLocation.toLowerCase().trim();
        filteredDonors = filteredDonors.filter(donor => 
          donor.location && donor.location.toLowerCase().includes(locationLower)
        );
      }
      
      console.log("Filtered donors:", filteredDonors);
      setMatchingDonors(filteredDonors);
    } catch (error) {
      console.error("Error finding compatible donors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return alert("Please log in to submit a request.");
  
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "bloodRequests"), {
        location: formData.location,
        bloodGroup: formData.bloodGroup,
        units: formData.units,
        date: formData.date,
        email: auth.currentUser.email,
        timestamp: serverTimestamp(),
      });
  
      console.log("Blood request submitted with ID:", docRef.id);
      alert("Blood request submitted successfully!");
      
      // Find compatible donors after submitting the request
      findCompatibleDonors(formData.bloodGroup, formData.location);
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Error submitting request: " + error.message);
    } finally {
      setLoading(false);
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

  // Function to manually refresh donor list
  const handleRefreshDonors = async () => {
    setLoading(true);
    try {
      const donorsSnapshot = await getDocs(collection(db, "bloodDonors"));
      const donorsList = [];
      donorsSnapshot.forEach((doc) => {
        donorsList.push({ id: doc.id, ...doc.data() });
      });
      setAllDonors(donorsList);
      console.log("Donors refreshed:", donorsList);
      
      // Re-apply filters if any
      if (formData.bloodGroup) {
        findCompatibleDonors(formData.bloodGroup, formData.location);
      }
      
      alert("Donor list refreshed!");
    } catch (error) {
      console.error("Error refreshing donors:", error);
      alert("Error refreshing donor list.");
    } finally {
      setLoading(false);
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

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>

      <div className="donor-search-section">
        <button 
          onClick={handleRefreshDonors} 
          className="refresh-donors-btn"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Donor List"}
        </button>
      </div>

      {formData.bloodGroup && (
        <div className="compatibility-info">
          <h3>Compatible Blood Groups for {formData.bloodGroup}</h3>
          <p>{bloodCompatibility[formData.bloodGroup].join(", ")}</p>
        </div>
      )}

      <div className="donor-list-section">
        <h3>
          {formData.bloodGroup 
            ? `Compatible Donors${formData.location ? ` in ${formData.location}` : ''}`
            : "All Registered Donors"}
        </h3>
        
        {loading ? (
          <div className="loading-spinner">Loading donors...</div>
        ) : formData.bloodGroup ? (
          matchingDonors.length > 0 ? (
            <div className="donors-list">
              {matchingDonors.map((donor) => (
                <div key={donor.id} className="donor-card">
                  <h4>{donor.name}</h4>
                  <p>Blood Group: {donor.bloodGroup}</p>
                  <p>Age: {donor.age}</p>
                  <p>Location: {donor.location}</p>
                  <p>Contact: {donor.contact}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-donors-message">
              <p>No compatible donors found{formData.location ? ` in ${formData.location}` : ''} for {formData.bloodGroup} blood group.</p>
            </div>
          )
        ) : allDonors.length > 0 ? (
          <div className="donors-list">
            {allDonors.map((donor) => (
              <div key={donor.id} className="donor-card">
                <h4>{donor.name}</h4>
                <p>Blood Group: {donor.bloodGroup}</p>
                <p>Age: {donor.age}</p>
                <p>Location: {donor.location}</p>
                <p>Contact: {donor.contact}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-donors-message">
            <p>No donors registered yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BloodRequest;