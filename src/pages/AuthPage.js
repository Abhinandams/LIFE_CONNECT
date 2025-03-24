import React, { useState } from "react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import '../styles/AuthPage.css';

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState("user");
  const [extraDetails, setExtraDetails] = useState({ name: "", location: "", contactNumber: "" });
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();

    try {
      let userCredential;
      if (isRegister) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        const userData = { email, role };
        if (role !== "user") {
          userData.name = extraDetails.name;
          userData.location = extraDetails.location;
          userData.contactNumber = extraDetails.contactNumber;
        }

        // Store data in separate Firestore collections based on role
        let collectionName = "users";
        if (role === "hospital") collectionName = "hospitals";
        else if (role === "police") collectionName = "police";
        else if (role === "ambulance") collectionName = "ambulances";

        await setDoc(doc(db, collectionName, user.uid), userData);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      
      alert(`Welcome, ${email}!`);
      navigate("/");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="pulse-circle circle-1"></div>
      <div className="pulse-circle circle-2"></div>

      <div className="auth-form-container">
        {/* Logo */}
        <div className="logo-container">
          <div className="logo-icon">❤️</div>
          <h1 className="app-title">Life Connect</h1>
        </div>
        
        {/* Tagline */}
        <p className="tagline">
          Accident reporting & blood emergency notifications
        </p>
        
        {/* Feature icons */}
        <div className="feature-icons">
          <div className="feature-icon">🚑</div>
          <div className="feature-icon">🩸</div>
          <div className="feature-icon">🚨</div>
        </div>
        
        {/* Login/Register form */}
        <div className="auth-form">
          <h2 className="form-title">{isRegister ? "Register" : "Login"}</h2>
          
          <form onSubmit={handleAuth}>
            {isRegister && (
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                className="form-input"
                required
              >
                <option value="user">User</option>
                <option value="hospital">Hospital</option>
                <option value="police">Police</option>
                <option value="ambulance">Ambulance</option>
              </select>
            )}
            
            {isRegister && role !== "user" && (
              <>
                <input
                  type="text"
                  placeholder={role === "police" ? "Police Station Name" : role === "ambulance" ? "Driver Name" : "Hospital Name"}
                  value={extraDetails.name}
                  onChange={(e) => setExtraDetails({ ...extraDetails, name: e.target.value })}
                  className="form-input"
                  required
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={extraDetails.location}
                  onChange={(e) => setExtraDetails({ ...extraDetails, location: e.target.value })}
                  className="form-input"
                  required
                />
                <input
                  type="text"
                  placeholder="Contact Number"
                  value={extraDetails.contactNumber}
                  onChange={(e) => setExtraDetails({ ...extraDetails, contactNumber: e.target.value })}
                  className="form-input"
                  required
                />
              </>
            )}
            
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
            
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
            
            <button 
              type="submit" 
              className="auth-button"
            >
              {isRegister ? "Register" : "Login"}
            </button>
          </form>
          
          {/* Toggle between login and register */}
          <p 
            className="toggle-auth"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;