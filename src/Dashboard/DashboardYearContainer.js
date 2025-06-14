import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import styles from "./Dashboard.module.css"; // Keep same CSS file

// Category name mapping - using the same as in DashboardContainer
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

function DashboardYearContainer({ year }) {
    // State to store processed data
    const [monthlyData, setMonthlyData] = useState([]);
    const [topCategories, setTopCategories] = useState([]);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Use the passed year prop instead of current year
    const selectedYear = year;

    useEffect(() => {
        // Color classes for categories
        const colorClasses = [
            styles.category1, // Darkest blue for highest expense
            styles.category2,
            styles.category3,
            styles.category4,
            styles.category5  // Lightest blue for lowest expense
        ];

        const processMonthlyData = (summaries) => {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            
            // Map each month to its actual values (no accumulation)
            const monthlyData = summaries.map((summary) => ({
                name: monthNames[summary.month - 1],
                expenses: parseFloat(summary.totalActual) || 0,
                budget: parseFloat(summary.totalPredicted) || 0,
                monthIndex: summary.month,
            }));

            // Sort by month index just in case
            monthlyData.sort((a, b) => a.monthIndex - b.monthIndex);
            setMonthlyData(monthlyData);
        };

        // Top 5 Categories by Expenses
        const calculateTopCategories = (categoryTotals) => {
            // Convert to array and sort by amount for top 5
            const categoriesArray = Object.entries(categoryTotals).map(([categoryId, amount]) => ({
                id: categoryId,
                name: categoryNames[categoryId] || `Category ${categoryId}`,
                amount: amount
            }));
            
            // Sort by amount (descending) and take top 5
            const top5Categories = categoriesArray
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 5)
                .map((category, index) => ({
                    ...category,
                    class: colorClasses[index]
                }));
            
            setTopCategories(top5Categories);
        };

        const fetchYearData = async () => {
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
                
                // Query all monthly summaries for the SELECTED year (not current year)
                const summariesRef = collection(db, "monthly_summaries");
                const yearQuery = query(
                    summariesRef,
                    where("userID", "==", userId),
                    where("year", "==", selectedYear)  // Changed from currentYear to selectedYear
                );
                
                const summariesSnapshot = await getDocs(yearQuery);
                
                if (summariesSnapshot.empty) {
                    // No data – fallback to default visuals
                    const defaultSummaries = Array.from({ length: 12 }, (_, i) => ({
                        month: i + 1,
                        totalActual: 0,
                        totalPredicted: 0,
                        categoryActuals: {},
                    }));

                    processMonthlyData(defaultSummaries);
                    setTopCategories([]);
                    setTotalExpenses(0);
                    setLoading(false);
                    return;
                }

                // Process the monthly summaries data
                const monthlySummaries = [];
                let categoryTotals = {};

                summariesSnapshot.forEach((doc) => {
                    const data = doc.data();
                    const monthIndex = data.month; // 1-12
                    
                    // Create monthly summary object
                    const monthlySummary = {
                        month: monthIndex,
                        totalActual: data.totalActual || 0,
                        totalPredicted: data.totalPredicted || 0,
                        categoryActuals: data.categoryActuals || {},
                    };
                    
                    monthlySummaries.push(monthlySummary);
                    
                    // Accumulate category totals for top categories calculation
                    if (data.categoryActuals) {
                        Object.entries(data.categoryActuals).forEach(([categoryId, amount]) => {
                            if (!categoryTotals[categoryId]) {
                                categoryTotals[categoryId] = 0;
                            }
                            categoryTotals[categoryId] += parseFloat(amount) || 0;
                        });
                    }
                });
                
                // Sort monthly summaries by month
                monthlySummaries.sort((a, b) => a.month - b.month);
                
                // Process the monthly data for the line chart
                processMonthlyData(monthlySummaries);
                
                // Calculate the top 5 categories by total
                calculateTopCategories(categoryTotals);
                
                // Calculate total expenses for the year 
                const total = monthlySummaries.reduce((sum, month) => sum + month.totalActual, 0);
                setTotalExpenses(total);
                
                setLoading(false);
            } catch (err) {
                console.error("Error fetching year data:", err);
                setError("Failed to load dashboard data");
                setLoading(false);
            }
        };
        
        fetchYearData();
    }, [selectedYear]); // Changed dependency from currentYear to selectedYear

    // Custom tooltip for the chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={styles.customTooltip}>
                    <p className={styles.tooltipLabel}>{`${label}`}</p>
                    <p className={styles.tooltipData}>
                        <span className={styles.expenseDot}></span>
                        {`Expenses: RM ${payload[0].value.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </p>
                    <p className={styles.tooltipData}>
                        <span className={styles.budgetDot}></span>
                        {`Budget: RM ${payload[1].value.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Format tick values for Y-axis
    const formatYAxis = (value) => {
        return `RM ${(value / 1000)}k`;
    };

    if (loading) {
        return <div className={styles.loading}></div>;
    }

    if (error) {
        return <div className={styles.error}>Error: {error}</div>;
    }

    return (
        <div className={styles.dashboard2Wrapper}>
            <section className={styles.dashboardContainer3}>
                <h3 className={styles.chartTitle}>Expenses VS Budget ({selectedYear})</h3>
                <div className={styles.chartContainer}>
                    {monthlyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart
                                data={monthlyData}
                                margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#666', fontSize: 12 }}
                                />
                                <YAxis 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#666', fontSize: 12 }}
                                    tickFormatter={formatYAxis}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend 
                                    verticalAlign="top" 
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '16px' }} 
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="expenses" 
                                    name="Expenses" 
                                    stroke="#3B82F6" 
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: "#3B82F6" }}
                                    activeDot={{ r: 6 }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="budget" 
                                    name="Budget" 
                                    stroke="#C416D8" 
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: "#C416D8" }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className={styles.noData}>No data available for {selectedYear}</div>
                    )}
                </div>
            </section>

            <div className={styles.rowContainer}>
                <section className={styles.dashboardContainer4}>
                    <h4 className={styles.sectionTitle}>Total Expenses Spent</h4>
                    <div className={styles.totalExpenses}>
                        RM {totalExpenses.toLocaleString('en-MY', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                        })}
                    </div>
                </section>

                <section className={styles.dashboardContainer5}>
                    <h4 className={styles.sectionTitle}>Top 5 Categories by Highest Expenses</h4>
                    
                    <div className={styles.categoriesContainer}>
                        {topCategories.length > 0 ? (
                            topCategories.map((category, index) => (
                                <div key={index} className={styles.categoryBox}>
                                    <div className={`${styles.categorySquare} ${category.class}`}></div>
                                    <div className={styles.categoryName}>{category.name}</div>
                                    <div className={styles.categoryAmount}>
                                        RM {category.amount.toLocaleString('en-MY', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.noData}>No category data available</div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default DashboardYearContainer;