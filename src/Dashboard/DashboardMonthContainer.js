import React from "react";
import styles from "./Dashboard.module.css"; // Keep same CSS file

function DashboardContainer() {
    return (
      <div className={styles.dashboardWrapper}> {/* New wrapper to align side by side */}
        <section className={styles.dashboardContainer1}>
          <div className={styles.cardMonthlyIncome}>Monthly Income</div>
          <div className={styles.cardBudget}>Budget</div>
          <div className={styles.cardBalance}>How much should you spend left?</div>
          <div className={styles.cardBudgetCategory}>Budget by Category</div>
        </section>
  
        <section className={styles.dashboardContainer2}>
            <div className={styles.dashboardContainer2Title}>Where did your money go?</div>
        </section>
      </div>
    );
  }
  
export default DashboardContainer;
