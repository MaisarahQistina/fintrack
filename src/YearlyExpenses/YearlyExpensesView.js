import React from "react";
import MonthsRow from "./MonthsRow";
import styles from "./YearlyExpensesView.module.css";

const firstHalfMonths = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
];
const secondHalfMonths = [
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function YearlyExpensesView() {
  return (
    <main className={styles.yearlyExpensesView}>
      <div className={styles.viewBy}>
      <img src="/Calendar.png" alt="Calendar" width="40" height="10" />2024
      </div>
      
      <section className={styles.monthsContainer}>
        <MonthsRow months={firstHalfMonths} />
        <MonthsRow months={secondHalfMonths} />
      </section>

      <div className={styles.taxRelief}>
        <img src="/taxFolder.png" alt="Folder Icon" />
        <span>Tax Relief</span>
    </div>
    </main>
  );
}

export default YearlyExpensesView;
