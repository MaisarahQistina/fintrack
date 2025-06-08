import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase"; 

import axios from "axios";
import sessionManager from "./utils/sessionManager";

import { FinTrackLanding } from "./LandingPage/FinTrackLanding"; 
import { SignIn } from "./SignIn/SignIn"; 
import { ExpensesUpload } from "./ExpensesUpload/ExpensesUpload"; 
import NavBar from "./LandingPage/components/NavBar";
import Profile from "./Profile/UserProfile";
import YearlyExpensesView from "./YearlyExpenses/YearlyExpensesView";
import MonthlyExpensesViewExpensesView from "./YearlyExpenses/MonthlyExpensesView";
import TaxReliefFolder from "./YearlyExpenses/TaxReliefFolder";
import UserInfographicView from "./Infographics/UserInfographicView";
import Dashboard from "./Dashboard/Dashboard";
import Feedback from "./Profile/Feedback";
import AdminHome from "./Admin/AdminHomepage/AdminHome";
import AdminFeedback from "./Admin/AdminFeedbacks/FeedbackPage";
import AdminInfographics from "./Admin/AdminInfographics/AdminInfographics";
import AdminTaxRelief from "./Admin/AdminTaxRelief/AdminTaxRelief";
import { Footer } from "./LandingPage/components/Footer"; 

import { ToastContainer } from "react-toastify";

const App = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const uid = authUser.uid;
        const email = authUser.email;

        // Try checking User collection first
        const userDoc = await getDoc(doc(db, "User", uid));

        if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({
              uid,
              name: data.fullName || "User",
              email,
              role: data.role || "user",
        });
      } else {
        // Then check Admin collection
        const adminDoc = await getDoc(doc(db, "Admin", uid));

        if (adminDoc.exists()) {
          const data = adminDoc.data();
          setUser({
            uid,
            name: data.fullName || "Admin",
            email,
            role: data.role || "admin",
          });
      } else {
        // Not found in either collection
        setUser({
          uid,
          name: "Unknown",
          email,
          role: "user", // fallback
        });
      }}

      // Start user session
      sessionManager.startSession();

        // Fetch ID Token and send to backend
        const idToken = await authUser.getIdToken();
        // Send the ID token to the backend for prediction
        axios.post("http://localhost:5000/predict-budget", { idToken })
          .then((response) => {
            console.log("Prediction response:", response.data);
            // Handle the prediction response as needed
          })
          .catch((error) => {
            console.error("Error sending ID token to backend:", error);

             // ✅ NEW: Log actual backend error message
            if (error.response) {
              console.error("❗ Server responded with:", error.response.data);
              alert("Backend error: " + (error.response.data.error || "Unknown error"));
            } else {
              console.error("No response from backend");
            }
          });
          
      } else {
        sessionManager.endSession();
        setUser(null);
      }

      setLoading(false);
    });

    return () => {
      sessionManager.endSession();
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <img alt="loading" src="./loading.svg" className="loading-spinner" />
        <p className="loading-text">Loading...</p>
      </div>
    );
  }  

  // 
  return (
    <div className="App">
      <NavBar user={user} />

      <main className="main-content">
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<FinTrackLanding />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignIn />} />

          {/* Protected Routes - Redirect if not logged in */}
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/" replace />}
          />
          <Route
            path="/my-expenses"
            element={user ? <ExpensesUpload /> : <Navigate to="/" replace />}
          />
          <Route
            path="/yearly-expenses"
            element={user ? <YearlyExpensesView /> : <Navigate to="/" replace />}
          />
          <Route
            path="/monthly-expenses"
            element={user ? <MonthlyExpensesViewExpensesView /> : <Navigate to="/" replace />}
          />
          <Route
            path="/tax-relief"
            element={user ? <TaxReliefFolder /> : <Navigate to="/" replace />}
          />
          <Route
            path="/infographics"
            element={user ? <UserInfographicView /> : <Navigate to="/" replace />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/" replace />}
          />
          <Route
            path="/feedback"
            element={user ? <Feedback user={user.uid} /> : <Navigate to="/" replace />}
          />

          {/* Admin only access */}
          <Route
            path="/admin-home"
            element={user?.role === "admin" ? <AdminHome /> : <Navigate to="/" replace />}
          />
          <Route
            path="/admin-feedback"
            element={user?.role === "admin" ? <AdminFeedback /> : <Navigate to="/" replace />}
          />
          <Route
            path="/admin-infographics"
            element={user?.role === "admin" ? <AdminInfographics /> : <Navigate to="/" replace />}
          />
          <Route
            path="/admin-taxrelief"
            element={user?.role === "admin" ? <AdminTaxRelief /> : <Navigate to="/" replace />}
          />
        </Routes>

        <ToastContainer />
        {location.pathname === "/" && <Footer user={user} />}
      </main>
    </div>
  );
};

export default App;
