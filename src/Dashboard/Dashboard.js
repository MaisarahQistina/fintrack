import React, { useState } from "react";
import styles from "./Dashboard.module.css";
import DashboardMonthContainer from "./DashboardMonthContainer";
import DashboardYearContainer from "./DashboardYearContainer";

function Dashboard() {
  const [view, setView] = useState("month"); // Track the current view

  return (
    <main className={styles.DashboardView}>
      {/* Title and Month/Year */}
        <div className={styles.title}>Dashboard
        <div className={styles.month}>
          {view === "month" ? "December 2024" : "2024"}
        </div>
        </div>

      {/* Show the correct container */}
      {view === "month" ? <DashboardMonthContainer /> : <DashboardYearContainer />}

      {/* Navigation Arrows */}
      <div className={styles.navigationButtons}>
        <img 
          src="/left-arrow.png" 
          alt="Left Arrow" 
          className={styles.arrow} 
          onClick={() => setView("month")} 
        />
        
        <img 
          src="/right-arrow.png" 
          alt="Right Arrow" 
          className={styles.arrow} 
          onClick={() => setView("year")} 
        />
      </div>
    </main>
  );
}

export default Dashboard;
