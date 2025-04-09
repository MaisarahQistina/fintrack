import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import styles from "./Dashboard.module.css";

function DashboardContainer() {
  const monthlyIncome = 5000.0;
  const budget = 4500.0;
  const expenses = 3189.0;
  const remaining = budget - expenses;

  const budgetCategoriesData = [
    { name: "Housing", value: 1300, color: "#FF8042" },
    { name: "Food", value: 700, color: "#00C49F" },
    { name: "Transportation", value: 450, color: "#FFBB28" },
    { name: "Utilities", value: 350, color: "#0088FE" },
    { name: "Entertainment", value: 250, color: "#FF6384" },
    { name: "Shopping", value: 300, color: "#36A2EB" },
    { name: "Savings", value: 300, color: "#8884d8" },
    { name: "Healthcare", value: 200, color: "#82ca9d" },
    { name: "Education", value: 150, color: "#ffc658" },
    { name: "Insurance", value: 180, color: "#a4de6c" },
    { name: "Childcare", value: 220, color: "#d0ed57" },
    { name: "Personal Care", value: 100, color: "#83a6ed" },
    { name: "Subscriptions", value: 80, color: "#8dd1e1" },
    { name: "Miscellaneous", value: 120, color: "#e288d8" },
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
              <div
                className={styles.customLegendColorBox}
                style={{ backgroundColor: entry.color }}
              ></div>
              <span>{entry.value}</span>
            </div>
          ))}
        </div>
        <div className={styles.customLegendColumn}>
          {secondHalf.map((entry, index) => (
            <div key={`legend-item-${index + 7}`} className={styles.customLegendItem}>
              <div
                className={styles.customLegendColorBox}
                style={{ backgroundColor: entry.color }}
              ></div>
              <span>{entry.value}</span>
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
          Budget by Category
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
      </section>
    </div>
  );
}

export default DashboardContainer;
