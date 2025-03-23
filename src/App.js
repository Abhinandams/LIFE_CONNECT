import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage"; 
import Home from "./pages/Home";
import BloodModule from "./pages/BloodModule";
import BloodRequest from "./pages/BloodRequest";
import BloodDonorRegistration from "./pages/BloodDonorRegistration";
import AccidentReporting from "./pages/AccidentReporting";  // ✅ Updated path
import AccidentReports from "./pages/AccidentReports";  // ✅ Updated path
import Profile from "./pages/Profile";  // ✅ Ensure correct path
import { auth } from "./firebase";
import { useState, useEffect } from "react";
import "../styles/App.css";

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
        <Route path="/accident-reporting" element={user ? <AccidentReporting /> : <Navigate to="/auth" />} />  {/* ✅ Fixed path */}
        <Route path="/accident-reports" element={user ? <AccidentReports /> : <Navigate to="/auth" />} />  {/* ✅ Fixed path */}
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/auth" />} />
      </Routes>
    </Router>
  );
}

export default App;
