import React, { useState } from "react";
import styles from "./Dashboard.module.css";
import DashboardMonthContainer from "./DashboardMonthContainer";
import DashboardYearContainer from "./DashboardYearContainer";

function Dashboard() {
  const [view, setView] = useState("month");
  
  // Initialize with current date
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth()); // 0-11

  // Month names for display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Navigation functions
  const navigateMonth = (direction) => {
    if (direction === "prev") {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  const navigateYear = (direction) => {
    if (direction === "prev") {
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedYear(selectedYear + 1);
    }
  };

  // Check if we can navigate forward (don't go beyond current date)
  const canNavigateForward = () => {
    const current = new Date();
    if (view === "month") {
      return selectedYear < current.getFullYear() || 
             (selectedYear === current.getFullYear() && selectedMonth < current.getMonth());
    } else {
      return selectedYear < current.getFullYear();
    }
  };

  return (
    <main className={styles.DashboardView}>
      {/* Title and Month/Year with Navigation */}
      <div className={styles.title}>
        User Dashboard
        <div className={styles.dateNavigation}>
          <img 
            src="/left-arrow.png" 
            alt="Previous" 
            className={styles.dateArrow} 
            onClick={() => view === "month" ? navigateMonth("prev") : navigateYear("prev")}
          />
          
          <div className={styles.month}>
            {view === "month" ? `${monthNames[selectedMonth]} ${selectedYear}` : `${selectedYear}`}
          </div>
          
          <img 
            src="/right-arrow.png" 
            alt="Next" 
            className={`${styles.dateArrow} ${!canNavigateForward() ? styles.disabled : ""}`}
            onClick={() => {
              if (canNavigateForward()) {
                view === "month" ? navigateMonth("next") : navigateYear("next");
              }
            }}
          />
        </div>
      </div>

      {/* Show the correct container with selected date */}
      {view === "month" ? 
        <DashboardMonthContainer year={selectedYear} month={selectedMonth} /> : 
        <DashboardYearContainer year={selectedYear} />
      }

      {/* View Toggle Buttons */}
      <div className={styles.navigationButtons}>
        <img 
          src="/left-arrow.png" 
          alt="Month View" 
          className={`${styles.arrow} ${view === "month" ? styles.active : ""}`}
          onClick={() => setView("month")} 
        />
        
        <img 
          src="/right-arrow.png" 
          alt="Year View" 
          className={`${styles.arrow} ${view === "year" ? styles.active : ""}`}
          onClick={() => setView("year")} 
        />
      </div>
    </main>
  );
}

export default Dashboard;