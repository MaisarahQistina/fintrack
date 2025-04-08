import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MonthsRow from "./MonthsRow";
import styles from "./YearlyExpensesView.module.css";

const firstHalfMonths = ["January", "February", "March", "April", "May", "June"];
const secondHalfMonths = ["July", "August", "September", "October", "November", "December"];

function YearlyExpensesView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [year, setYear] = useState(new Date().getFullYear().toString()); // Default to current year
  
  useEffect(() => {
    // Get the year from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const yearParam = queryParams.get('year');
    
    if (yearParam) {
      setYear(yearParam);
    }
    
    // Optional: You could fetch receipts for the specified year here
    // fetchReceiptsForYear(yearParam || year);
  }, [location.search]);

  const handleTaxReliefClick = () => {
    navigate("/tax-relief");
  };

  return (
    <main className={styles.yearlyExpensesView}>
      <div className={styles.viewBy}>
        <img src="/Calendar.png" alt="Calendar" width="40" height="10" /> {year}
      </div>

      <section className={styles.monthsContainer}>
        <MonthsRow months={firstHalfMonths} year={year} />
        <MonthsRow months={secondHalfMonths} year={year} />
      </section>

      {/* Tax Relief Folder */}
      <div className={styles.taxRelief} onClick={handleTaxReliefClick} style={{ cursor: "pointer" }}>
        <img src="/taxFolder.png" alt="Folder Icon" />
        <span>Tax Relief</span>
      </div>
    </main>
    
  );
}

export default YearlyExpensesView;