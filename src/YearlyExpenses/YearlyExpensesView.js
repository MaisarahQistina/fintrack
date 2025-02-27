import React from "react";
import { useNavigate } from "react-router-dom";
import MonthsRow from "./MonthsRow";
import styles from "./YearlyExpensesView.module.css";

const firstHalfMonths = ["January", "February", "March", "April", "May", "June"];
const secondHalfMonths = ["July", "August", "September", "October", "November", "December"];

function YearlyExpensesView() {
  const navigate = useNavigate();

  const handleTaxReliefClick = () => {
    navigate("/tax-relief");
  };

  return (
    <main className={styles.yearlyExpensesView}>
      <div className={styles.viewBy}>
        <img src="/Calendar.png" alt="Calendar" width="40" height="10" /> 2024
      </div>

      <section className={styles.monthsContainer}>
        <MonthsRow months={firstHalfMonths} />
        <MonthsRow months={secondHalfMonths} />
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
