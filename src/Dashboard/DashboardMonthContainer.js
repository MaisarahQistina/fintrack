import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import styles from "./Dashboard.module.css";

// Colors for different categories
  const categoryColors = {
    0: "#FF6384",   // Red-ish
    1: "#36A2EB",   // Blue
    2: "#FFCE56",   // Yellow
    3: "#4BC0C0",   // Teal
    4: "#9966FF",   // Purple
    5: "#FF9F40",   // Orange
    6: "#C9CBCF",   // Light Gray
    7: "#8BC34A",   // Light Green
    8: "#E91E63",   // Hot Pink
    9: "#3F51B5",   // Indigo
    10: "#00BCD4",  // Cyan
    11: "#CDDC39",  // Lime
    12: "#9C27B0",  // Violet
    13: "#FF5722",  // Deep Orange
    14: "#607D8B",  // Slate
    15: "#795548",  // Brown
    16: "#009688",  // Sea Green
    17: "#FFC107",  // Amber
    18: "#673AB7",  // Deep Purple
    19: "#AED581",  // Soft Green
  };

  // Category name mapping
  const categoryNames = {
    "0": "Family",
    "1": "Insurance",
    "2": "Food & Drinks",
    "3": "Groceries",
    "4": "Medical Expenses",
    "5": "Rent",
    "6": "Utilities",
    "7": "Education",
    "8": "Books & Magazines",
    "9": "Gadget & Electronics",
    "10": "Subscription",
    "11": "Contributions",
    "12": "Transportation",
    "13": "Sports",
    "14": "Apparel",
    "15": "Entertainment",
    "16": "Personal Care & Beauty",
    "17": "Travel",
    "18": "Accessories",
    "19": "Miscellaneous Items",
  };

function DashboardMonthContainer({ selectedMonth, selectedYear }) {
  // State for all the dynamic data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [budget, setBudget] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [budgetCategoriesData, setBudgetCategoriesData] = useState([]);
  const [spendingData, setSpendingData] = useState([]);

  // Get current date info for database queries
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear(); // 2025
  const currentMonth = currentDate.getMonth() + 1; // May = 5

  useEffect(() => {
  async function fetchData() {
    try {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError("User not logged in");
        setLoading(false);
        return;
      }

      const db = getFirestore();
      const userId = user.uid;

      // Fetch user profile for income and overall budget if needed
      const userProfileRef = doc(db, "User", userId);
      const userProfileSnap = await getDoc(userProfileRef);
      if (userProfileSnap.exists()) {
        const profileData = userProfileSnap.data();
        const income = Number(profileData.monthlyIncome) || 0; // Convert to number explicitly
        setMonthlyIncome(income);
      }

      // Fetch monthly summary document for the current month and year
      const summaryId = `${userId}_${currentYear}_${currentMonth}`;
      const monthlySummaryRef = doc(db, "monthly_summaries", summaryId);
      const monthlySummarySnap = await getDoc(monthlySummaryRef);

      if (monthlySummarySnap.exists()) {
        const summaryData = monthlySummarySnap.data();

        // Use categoryActuals directly
        const categoriesActual = Object.fromEntries(
          Object.entries(summaryData.categoryActuals || {}).map(([k, v]) => [parseInt(k), v])
        );

        // Use categoryPredictions as your budget data
        const categoriesBudget = Object.fromEntries(
          Object.entries(summaryData.categoryPredictions || {}).map(([k, v]) => [parseInt(k), v])
        );

        // Calculate total expenses from actuals or fallback to summary totalActual
        const totalExpenses = Object.values(categoriesActual).reduce((sum, val) => sum + val, 0) 
                              || summaryData.totalActual || 0;
        setExpenses(totalExpenses);

        // Calculate remaining budget (totalPredicted - actual expenses)
        const totalBudget = Object.values(categoriesBudget).reduce((sum, val) => sum + val, 0)
                           || summaryData.totalPredicted || 0;
        setBudget(totalBudget);
        setRemaining(totalBudget - totalExpenses);

        // Prepare pie chart data for budget categories (from predictions)
        const budgetPieData = Object.entries(categoriesBudget).map(([catId, amount]) => ({
          name: categoryNames[catId] || `Category ${catId}`,
          value: amount,
          color: categoryColors[catId] || `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        }));
        setBudgetCategoriesData(budgetPieData);

        // Prepare spending breakdown (budget vs spent per category)
        const spendingBreakdown = Object.entries(categoriesBudget).map(([catId, budgetAmount]) => {
          const numericCatId = parseInt(catId);
          return {
            name: categoryNames[numericCatId] || `Category ${numericCatId}`,
            value: budgetAmount,
            spent: categoriesActual[numericCatId] || 0,
            color: categoryColors[numericCatId] || `#${Math.floor(Math.random() * 16777215).toString(16)}`,
          };
        });
        setSpendingData(spendingBreakdown);
      } else {
        // No summary found – fallback to empty state
        setExpenses(0);
        setBudget(0);
        setRemaining(0);
        setBudgetCategoriesData([]);
        setSpendingData([]);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load dashboard data");
      setLoading(false);
    }
  }

  fetchData();
}, [currentMonth, currentYear]);

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
    // Split the legend into two columns for better display
    const halfwayPoint = Math.ceil(payload.length / 2);
    const firstHalf = payload.slice(0, halfwayPoint);
    const secondHalf = payload.slice(halfwayPoint);

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
            <div key={`legend-item-${index + halfwayPoint}`} className={styles.customLegendItem}>
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

  if (loading) {
    return <div className={styles.loading}></div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

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
              {budgetCategoriesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={budgetCategoriesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={98}
                      innerRadius={70}
                      dataKey="value"
                    >
                      {budgetCategoriesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className={styles.noBudgetData}>No budget categories found</div>
              )}
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
        <div className={styles.dashboardContainer2Title}>
          Where did your money go?
        </div>
        <div className={styles.spendingBreakdownWrapper}>
          {spendingData.length > 0 ? (
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
                        width: `${Math.min((category.spent / category.value) * 100, 100)}%`,
                        backgroundColor: category.color 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noSpendingData}>No spending data available for May 2025</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default DashboardMonthContainer;