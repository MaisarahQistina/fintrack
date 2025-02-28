import React from "react";
import styles from "./Dashboard.module.css"; // Keep same CSS file

function DashboardContainer() {
    return (
      <div className={styles.dashboard2Wrapper}> 
        <section className={styles.dashboardContainer3}>
          Expenses VS Budget
        </section>
  
      <div className={styles.rowContainer}>
        <section className={styles.dashboardContainer4}>
          Total Expenses Spent
        </section>

        <section className={styles.dashboardContainer5}>
          Top 5 Categories by Highest Expenses
        </section>
      </div>
      </div>
    );
  }
  
export default DashboardContainer;
