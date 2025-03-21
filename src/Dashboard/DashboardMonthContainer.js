import React from "react";
import styles from "./Dashboard.module.css"; // Main layout CSS

function DashboardContainer() {
    // Data from your requirements
    const monthlyIncome = 5000.00;
    const budget = 4500.00;
    const expenses = 3189.00;
    const remaining = budget - expenses;

    return (
      <div className={styles.dashboardWrapper}>
        <section className={styles.dashboardContainer1}>
          <div className={styles.cardMonthlyIncome}>
            Monthly Income
            <div className={styles.MonthlyIncome}>RM {monthlyIncome.toFixed(2)}</div>
          </div>
          <div className={styles.cardBudget}>
            Budget
            <div className={styles.Budget}>RM {budget.toFixed(2)}</div>
          </div>
          
          <div className={styles.cardBalance}>
            <h3 className="balanceTitle">How much should you spend left?</h3>
            
            {/* Progress bar container */}
            <div className={styles.progressBarContainer}>
              {/* Expenses bar */}
              <div 
                className={styles.expensesBar} 
                style={{ width: `${(expenses / monthlyIncome) * 100}%` }}
              ></div>
              
              {/* Budget bar */}
              <div 
                className={styles.budgetBar}
                style={{ width: `${((budget - expenses) / monthlyIncome) * 100}%` }}
              ></div>
            </div>
            
            <div className={styles.legendSpendContainer}>
              {/* Legend */}
              <div className={styles.legendContainer}>
                <div className={styles.legendItem}>
                  <div className={styles.expensesColor}></div>
                  <span>Expenses - RM {expenses.toFixed(2)}</span>
                </div>
                
                <div className={styles.legendItem}>
                  <div className={styles.budgetColor}></div>
                  <span>Budget - RM {budget.toFixed(2)}</span>
                </div>

                <div className={styles.legendItem}>
                  <div className={styles.incomeColor}></div>
                  <span>Monthly Income - RM {monthlyIncome.toFixed(2)}</span>
                </div>
              </div>

              {/* Remaining amount */}
              <div className={styles.remainingContainer}>
                <p className={styles.remainingLabel}>Available to spend</p>
                <span className={styles.remainingAmount}>RM {remaining.toFixed(2)}</span>
              </div>
            </div>
            
          </div>

          <div className={styles.cardBudgetCategory}>Budget by Category</div>
        </section>
  
        <section className={styles.dashboardContainer2}>
            <div className={styles.dashboardContainer2Title}>Where did your money go?</div>
        </section>
      </div>
    );
  }
  
export default DashboardContainer;