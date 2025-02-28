import React from "react";
import { Link, useLocation } from "react-router-dom";

const NavBar = ({ user, onSignOut }) => {
  const location = useLocation();

  // Define navigation links based on user role
  const guestNavLinks = [{ text: "Home", path: "/" }];

  const userNavLinks = [
    { text: "Home", path: "/" },
    { text: "My Expenses", path: "/my-expenses" },
    { text: "Dashboard", path: "/dashboard" },
    { text: "Infographics", path: "/infographics" },
  ];

  const adminNavLinks = [
    { text: "Home", path: "/admin-home" },
    { text: "Tax Relief", path: "/admin-taxrelief" },
    { text: "Infographics", path: "/admin-infographics" },
    { text: "Feedbacks", path: "/admin-feedbacks" },
  ];

  // Determine which links to display
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
          {linksToShow.map(({ text, path }, index) => (
            <Link
              key={index}
              to={path}
              className={`text-white text-lg cursor-pointer ${
                location.pathname === path ? "border-b-2 border-white" : ""
              }`}
            >
              {text}
            </Link>
          ))}
        </nav>
      </div>

      {/* User Authentication Section */}
      <div className="flex gap-4 ml-auto font-nats">
        {user ? (
          <>
            <span className="text-white">Hi, {user.name}!</span>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded"
              onClick={onSignOut}
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
