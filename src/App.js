import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import { FinTrackLanding } from "./LandingPage/FinTrackLanding"; 
import { SignIn } from "./SignIn/SignIn"; 
import { ExpensesUpload } from "./ExpensesUpload/ExpensesUpload"; 
import NavBar from "./LandingPage/components/NavBar";
import YearlyExpensesView from "./YearlyExpenses/YearlyExpensesView";
import MonthlyExpensesViewExpensesView from "./YearlyExpenses/MonthlyExpensesView";
import UserInfographicView from "./Infographics/UserInfographicView";
// import { Footer } from "./LandingPage/components/Footer"; // Your shared footer component

const App = () => {
  const location = useLocation();

  return (
    <div className="App">
      {/* Shared Header */}
      <NavBar />

      <main className="main-content">
        {/* Define Routes */}
        <Routes>
          <Route path="/" element={<FinTrackLanding />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignIn />} />
          <Route path="/my-expenses" element={<ExpensesUpload />} />
          <Route path="/yearly-expenses" element={<YearlyExpensesView />} />
          <Route path="/monthly-expenses" element={<MonthlyExpensesViewExpensesView />} />
          <Route path="/infographics" element={<UserInfographicView />} />
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
