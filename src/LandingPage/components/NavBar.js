import React from "react";
import { Link, useLocation } from "react-router-dom";

import { signOut } from "firebase/auth";
import { auth } from "../../firebase"; 

const NavBar = ({ user }) => {
  const location = useLocation();

  // Define navigation links based on user role
  const guestNavLinks = [{ text: "Home", path: "/" }];

  const userNavLinks = [
    { text: "Home", path: "/" },
    { text: "Profile", path: "/profile" },
    { text: "Expenses", path: "/my-expenses" },
    { text: "Dashboard", path: "/dashboard" },
    { text: "Financial Tips", path: "/infographics" },
  ];

  const adminNavLinks = [
    { text: "Home", path: "/admin-home" },
    { text: "Tax Relief", path: "/admin-taxrelief" },
    { text: "Infographics", path: "/admin-infographics" },
    { text: "Feedbacks", path: "/admin-feedback" },
  ];

  const linksToShow = user
    ? user.role === "admin"
      ? adminNavLinks
      : userNavLinks
    : guestNavLinks;

  return (
    <header className="flex items-center px-6 w-full bg-[#05445E] border-b border-solid border-b-stone-500 min-h-[72px]">
      {/* Logo & Navigation */}
      <div className="flex items-center gap-6">
        {/* Logo */}
        <div className="text-4xl font-bold text-white font-abhaya">FINTRACK.</div>

        {/* Navigation Links */}
        <nav className="flex gap-4 font-nats">
          {linksToShow.map(({ text, path }, index) => {
            // Check for matching routes to apply underline
            const isExpensesPage =
              text === "Expenses" &&
              (location.pathname === "/my-expenses" ||
                location.pathname === "/yearly-expenses" ||
                location.pathname === "/monthly-expenses" ||
                location.pathname === "/tax-relief");

            return (
              <Link
                key={index}
                to={path}
                className={`text-white text-lg cursor-pointer ${
                  location.pathname === path || isExpensesPage ? "border-b-2 border-white" : ""
                }`}
              >
                {text}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Authentication Section */}
      <div className="flex items-center gap-4 ml-auto font-nats">
        {user ? (
          <>
            <span className="text-white text-lg">Hi, {user.name}!</span>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded"
              onClick={() => signOut(auth)}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/sign-in"
              className="px-4 py-2 border border-white text-white rounded font-montserrat text-sm"
            >
              Sign In
            </Link>
            <Link
              to="/sign-up"
              className="px-4 py-2 bg-cyan-100 text-sky-900 rounded font-montserrat text-sm"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default NavBar;
