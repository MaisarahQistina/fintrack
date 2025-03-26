import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase"; // Import your Firebase setup

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
import AdminHome from "./Admin/AdminHomepage/AdminHome";
import AdminFeedback from "./Admin/AdminFeedbacks/FeedbackPage";
import AdminInfographics from "./Admin/AdminInfographics/AdminInfographics";
import AdminTaxRelief from "./Admin/AdminTaxRelief/AdminTaxRelief";
import { Footer } from "./LandingPage/components/Footer"; // Your shared footer component

import { ToastContainer } from "react-toastify";

const App = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(db, "User", authUser.uid));
        
        setUser({
          name: userDoc.exists() ? userDoc.data().fullName : "User",
          email: authUser.email,
          role: userDoc.exists() ? userDoc.data().role : "user", // Default role
        });
      } else {
        setUser(null);
      }
      setLoading(false); // Update loading state
    });

    return () => unsubscribe(); // Clean up listener 
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

          {/* Admin only access */}
          <Route
            path="/admin-home"
            element={user?.role === "admin" ? <AdminHome /> : <Navigate to="/" replace />}
          />
          <Route
            path="/admin-feedback"
            element={user ? <AdminFeedback /> : <Navigate to="/" replace />}
          />
          <Route
            path="/admin-infographics"
            element={user ? <AdminInfographics /> : <Navigate to="/" replace />}
          />
          <Route
            path="/admin-taxrelief"
            element={user ? <AdminTaxRelief /> : <Navigate to="/" replace />}
          />
        </Routes>

        <ToastContainer />
        {location.pathname === "/" && <Footer user={user} />}
      </main>
    </div>
  );
};

export default App;
