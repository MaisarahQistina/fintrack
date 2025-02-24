import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import { FinTrackLanding } from "./LandingPage/FinTrackLanding"; 
import { SignIn } from "./SignIn/SignIn"; 
// import { NavBar } from "./LandingPage/components/NavBar"; // Your shared header component
// import { Footer } from "./LandingPage/components/Footer"; // Your shared footer component

const App = () => {
  const location = useLocation();

  return (
    <div className="App">
      {/* Shared Header */}
      {/* <NavBar /> */}

      <main className="main-content">
        {/* Define Routes */}
        <Routes>
          <Route path="/" element={<FinTrackLanding />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignIn />} />
          {/* Add more routes as needed */}
        </Routes>

        {location.pathname === '/' && (
          <>
            {/* <Footer /> */}
          </>
        )}
      </main>

    </div>
  );
};

export default App;
