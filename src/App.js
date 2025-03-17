import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage"; 
import Home from "./pages/Home";
import BloodModule from "./pages/BloodModule";
import BloodRequest from "./pages/BloodRequest";
import BloodDonorRegistration from "./pages/BloodDonorRegistration";
import Profile from "../src/pages/Profile";
import { auth } from "./firebase";
import { useState, useEffect } from "react";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Firebase listener to check authentication status
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  return (
    <Router>
      <Routes>
        {/* If user is not logged in, redirect to auth page */}
        <Route path="/" element={user ? <Home /> : <Navigate to="/auth" />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/blood-module" element={user ? <BloodModule /> : <Navigate to="/auth" />} />
        <Route path="/blood-request" element={user ? <BloodRequest /> : <Navigate to="/auth" />} />
        <Route path="/blood-donor-registration" element={user ? <BloodDonorRegistration /> : <Navigate to="/auth" />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/auth" />} /> {/* ✅ FIXED */}
      </Routes>
    </Router>
  );
}

export default App;
