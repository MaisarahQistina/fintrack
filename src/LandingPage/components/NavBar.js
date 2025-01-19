import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // React Router for navigation

export function NavBar() {
  const [activeTab, setActiveTab] = useState("Home"); // Track the active tab
  const navigate = useNavigate(); // Navigation hook

  const handleNavigation = (tabName, path) => {
    setActiveTab(tabName); // Set the active tab
    navigate(path); // Redirect to the specified path
  };

  return (
    <div className="flex items-center justify-between px-6 w-full bg-sky-900 border-b border-solid border-b-stone-500 min-h-[72px] max-md:px-5 max-md:max-w-full">
      {/* Brand and Navigation */}
      <div className="flex gap-4 items-center text-white whitespace-nowrap min-w-[240px]">
        <div className="text-4xl font-bold text-center text-[40px] font-abhaya">
          FINTRACK.
        </div>
        <div className="flex gap-4 items-center text-2xl">
          <div
            className={`gap-2.5 p-2.5 border-b text-[20px] font-nats ${
              activeTab === "Home" ? "border-white" : "border-transparent"
            } cursor-pointer`}
            onClick={() => handleNavigation("Home", "/")} // Navigate to homepage
          >
            Home
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex ml-auto gap-4">
        {/* Sign In Button */}
        <button
          className="flex items-center px-4 py-2.5 bg-transparent border border-white rounded"
          onClick={() => handleNavigation("SignIn", "/sign-in")}
        >
          <span className="text-sm font-semibold text-white text-[14px] font-montserrat">Sign In</span>
        </button>

        {/* Sign Up Button */}
        <button
          className="flex items-center px-4 py-2.5 bg-cyan-100 rounded"
          onClick={() => handleNavigation("SignUp", "/signup")}
        >
          <span className="text-sm font-semibold text-sky-900 text-[14px] font-montserrat">Sign Up</span>
        </button>
      </div>
    </div>
  );
}
