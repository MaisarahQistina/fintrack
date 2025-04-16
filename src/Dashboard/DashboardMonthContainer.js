import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import styles from "./Dashboard.module.css";

function DashboardContainer() {
  const monthlyIncome = 5000.0;
  const budget = 4500.0;
  const expenses = 3189.0;
  const remaining = budget - expenses;

  const budgetCategoriesData = [
    { name: "Rent", value: 1300, color: "#FF8042" },
    { name: "Family", value: 700, color: "#00C49F" },
    { name: "Personal Gadget", value: 450, color: "#FFBB28" },
    { name: "Internet Subscription", value: 350, color: "#0088FE" },
    { name: "Food & Drinks", value: 250, color: "#FF6384" },
    { name: "Transportation", value: 300, color: "#36A2EB" },
    { name: "Sports", value: 300, color: "#8884d8" },
    { name: "Insurance", value: 200, color: "#82ca9d" },
    { name: "Contributions", value: 150, color: "#ffc658" },
    { name: "Groceries", value: 180, color: "#a4de6c" },
    { name: "Healthcare", value: 220, color: "#d0ed57" },
    { name: "Utilities", value: 100, color: "#83a6ed" },
    { name: "Education", value: 80, color: "#8dd1e1" },
    { name: "Books & Magazines", value: 120, color: "#e288d8" },
  ];

  // Creating spending data similar to your screenshot
  const spendingData = [
    { name: "Family", value: 700, spent: 690, color: "#00C49F" },
    { name: "Education", value: 80, spent: 75, color: "#8dd1e1" },
    { name: "Insurance", value: 200, spent: 175, color: "#82ca9d" },
    { name: "Transportation", value: 300, spent: 175, color: "#36A2EB" },
    { name: "Rent", value: 1300, spent: 1079, color: "#FF8042" },
    { name: "Groceries", value: 180, spent: 100, color: "#a4de6c" },
    { name: "Utilities", value: 100, spent: 81, color: "#83a6ed" },
    { name: "Healthcare", value: 220, spent: 181, color: "#d0ed57" },
    { name: "Internet Subscription", value: 350, spent: 272, color: "#0088FE" },
    { name: "Food & Drinks", value: 250, spent: 193, color: "#FF6384" },
    { name: "Sports", value: 300, spent: 227, color: "#8884d8" },
    { name: "Contributions", value: 150, spent: 0, color: "#ffc658" },
    { name: "Books & Magazines", value: 120, spent: 90, color: "#e288d8" },
    { name: "Personal Gadget", value: 450, spent: 327, color: "#FFBB28" },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.customTooltipTitle}>{payload[0].name}</p>
          <p className={styles.customTooltipValue}>RM {payload[0].value.toFixed(2)}</p>
          <p className={styles.customTooltipPercentage}>
            {(payload[0].value / budget * 100).toFixed(1)}% of budget
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomizedLegend = (props) => {
    const { payload } = props;
    const firstHalf = payload.slice(0, 7);
    const secondHalf = payload.slice(7);
  
    return (
      <div className={styles.customLegend}>
        <div className={styles.customLegendColumn}>
          {firstHalf.map((entry, index) => (
            <div key={`legend-item-${index}`} className={styles.customLegendItem}>
              <div className={styles.legendLabel}>
                <div
                  className={styles.customLegendColorBox}
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className={styles.legendName}>{entry.value}</span>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.customLegendColumn}>
          {secondHalf.map((entry, index) => (
            <div key={`legend-item-${index + 7}`} className={styles.customLegendItem}>
              <div className={styles.legendLabel}>
                <div
                  className={styles.customLegendColorBox}
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className={styles.legendName}>{entry.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
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

          <div className={styles.progressBarContainer}>
            <div
              className={styles.expensesBar}
              style={{ width: `${(expenses / monthlyIncome) * 100}%` }}
            ></div>

            <div
              className={styles.budgetBar}
              style={{ width: `${((budget - expenses) / monthlyIncome) * 100}%` }}
            ></div>
          </div>

          <div className={styles.legendSpendContainer}>
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

            <div className={styles.remainingContainer}>
              <p className={styles.remainingLabel}>Available to spend</p>
              <span className={styles.remainingAmount}>RM {remaining.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className={styles.cardBudgetCategory}>
          <div className={styles.pieTitle}>Budget by Category</div>
          <div className={`${styles.flex} ${styles.h80} ${styles.wFull}`}>
            <div className={styles.wThreeFourths}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budgetCategoriesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={105}
                    innerRadius={60}
                    dataKey="value"
                  >
                    {budgetCategoriesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.wOneFourth}>
              <CustomizedLegend
                payload={budgetCategoriesData.map((item) => ({
                  value: item.name,
                  color: item.color,
                  type: "square",
                }))}
              />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.dashboardContainer2}>
        <div className={styles.dashboardContainer2Title}>Where did your money go?</div>
        <div className={styles.spendingBreakdownWrapper}>
          <div className={styles.spendingBreakdown}>
            {spendingData.map((category, index) => (
              <div key={`spending-${index}`} className={styles.spendingCategory}>
                <div className={styles.spendingCategoryHeader}>
                  <div className={styles.spendingCategoryName}>
                    <div 
                      className={styles.categoryColorIndicator} 
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span>{category.name}</span>
                  </div>
                  <div className={styles.spendingValues}>
                    <span className={styles.spendingAmount}>
                      RM {category.spent.toFixed(2)}
                    </span>
                    <span className={styles.spendingBudget}>
                      / RM {category.value.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className={styles.spendingProgressContainer}>
                  <div 
                    className={styles.spendingProgressBar}
                    style={{ 
                      width: `${(category.spent / category.value) * 100}%`,
                      backgroundColor: category.color 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardContainer;