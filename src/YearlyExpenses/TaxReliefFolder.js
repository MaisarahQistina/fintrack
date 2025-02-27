import React from "react";
import TaxRelief from "./TaxRelief";
import styles from "./MonthlyExpensesView.module.css";

function MonthlyExpensesView() {
    return (
        <main className={styles.monthlyExpensesView}>
            {/* View By Section */}
            <div className={styles.viewBy}>
                <img src="/Calendar.png" alt="Calendar" width="40" height="40" />
                <span>{"2024 > Tax Relief"}</span>
            </div>

            {/* Dropdown Selection */}
            <div className={styles.viewDropdown}>
                <select name="year" id="year" className={styles.monthSelect}>
                    <option value="">- Select Category -</option>
                    <option value="1">Medical Expenses</option>
                    <option value="2">Education</option>
                    <option value="3">Food and Beverages</option>
                </select>

              <button className={styles.reliefDownload}>
                <img src="/download.png" alt="Download" style={{ width: "16px", height: "16px" }} />
                Download
              </button>
            </div>

            {/* Receipts Grid */}
            <TaxRelief />
        </main>
    );
}

export default MonthlyExpensesView;
