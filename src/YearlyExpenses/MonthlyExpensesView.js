import React from "react";
import ReceiptsView from "./ReceiptsView";
import styles from "./MonthlyExpensesView.module.css";

function MonthlyExpensesView() {
    return (
        <main className={styles.monthlyExpensesView}>
            {/* View By Section */}
            <div className={styles.viewBy}>
                <img src="/Calendar.png" alt="Calendar" width="40" height="40" />
                <span>{"2024 > January"}</span>
            </div>

            {/* Dropdown Selection */}
            <div className={styles.viewDropdown}>
                <select name="year" id="year" className={styles.monthSelect}>
                    <option value="">- Select Category -</option>
                    <option value="1">Medical Expenses</option>
                    <option value="2">Education</option>
                    <option value="3">Food and Beverages</option>
                </select>
            </div>

            {/* Receipts Grid */}
            <ReceiptsView />
        </main>
    );
}

export default MonthlyExpensesView;
