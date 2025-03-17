import React, { useState } from "react";
import { auth } from "../firebase";
import '../styles/AuthPage.css';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();

    try {
      let userCredential;
      if (isRegister) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      const user = userCredential.user;
      alert(`Welcome, ${user.email}!`);

      // Navigate to the home page after login
      navigate("/");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>{isRegister ? "Register" : "Login"}</h2>
        <form onSubmit={handleAuth}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{isRegister ? "Register" : "Login"}</button>
        </form>
        <p onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
