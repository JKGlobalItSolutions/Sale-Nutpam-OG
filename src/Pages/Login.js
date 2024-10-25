import React, { useState } from "react";
import { auth, db } from "../firebase/firebase"; // Import Firebase Auth and Firestore instances
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import { doc, setDoc, getDoc } from "firebase/firestore"; // Import Firestore functions
import logo from '../images/logo.jpg';
import "../Styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // Declare password state
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // Initialize useNavigate

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic form validation
    if (!email || !password) {
      setErrorMessage("Both email and password are required.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      // Firebase login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Logged in successfully:", user);

      // Check if Firestore document for the user exists using user.uid
      const userDocRef = doc(db, "users", user.uid); // Reference to a document named after the user's UID
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // If no document exists for the user, create one
        await setDoc(userDocRef, {
          createdAt: new Date(),
          email: email,
          data: [] // You can initialize with any data you'd like
        });
        console.log("Created a new collection for:", user.uid);
      } else {
        console.log("User collection already exists for:", user.uid);
      }

      // Redirect to Home after successful login
      navigate("/home"); // Change this to your home route
    } catch (error) {
      // Handle specific error codes for better feedback
      if (error.code === 'auth/wrong-password') {
        setErrorMessage("Incorrect password. Please try again.");
      } else if (error.code === 'auth/user-not-found') {
        setErrorMessage("No user found with this email. Please sign up.");
      } else {
        setErrorMessage("Failed to log in: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle password visibility
  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="container-fluid bag mt-0">
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="card col-10 col-md-6 col-lg-4 p-1 p-lg-4 shadow">
          <div className="card-body">
            <img className="img-fluid" src={logo} alt="Logo" />
            <form className="mt-4" id="loginForm" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">User ID:</label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading} // Disable when loading
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password:</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} // Update password state
                    required
                    disabled={loading} // Disable when loading
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={togglePassword}
                    disabled={loading} // Disable when loading
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              {errorMessage && (
                <div id="error-message" className="text-danger mt-2" aria-live="assertive">
                  {errorMessage}
                </div>
              )}
              <div className="text-center">
                <button
                  style={{ backgroundColor: '#FF0000', color: 'white' }}
                  type="submit"
                  className="btn mt-3 w-100"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </div>
              <p style={{ color: "#00000080" }} className="text-center mt-3 fw-bolder">
                <span>&copy;</span> 2024 SaleNutpam
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
