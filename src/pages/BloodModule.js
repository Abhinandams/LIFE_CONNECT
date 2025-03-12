import React from "react";
import { useNavigate } from "react-router-dom";

const BloodModule = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h2>Blood Module</h2>
      <button onClick={() => navigate("/blood-request")}>Request Blood</button>
      <button onClick={() => navigate("/blood-donor-registration")}>Become a Donor</button>
    </div>
  );
};

export default BloodModule;