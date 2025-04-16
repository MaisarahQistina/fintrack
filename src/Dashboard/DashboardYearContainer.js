import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import styles from "./Dashboard.module.css"; // Keep same CSS file

function DashboardContainer() {
    // Sample data for top 5 categories
    const topCategories = [
        { name: "Rent", amount: 96500.00, class: styles.category1 },
        { name: "Food & Drinks", amount: 54300.00, class: styles.category2 },
        { name: "Transportation", amount: 38500.00, class: styles.category3 },
        { name: "Internet Subscription", amount: 25800.00, class: styles.category4 },
        { name: "Healthcare", amount: 18900.00, class: styles.category5 }
    ];

    // Sort categories by amount 
    const sortedCategories = [...topCategories].sort((a, b) => b.amount - a.amount);
    const colorClasses = [
        styles.category1, // Darkest blue for highest expense
        styles.category2,
        styles.category3,
        styles.category4,
        styles.category5  // Lightest blue for lowest expense
    ];

    // Create final data with updated class assignments
    const categoriesWithClasses = sortedCategories.map((category, index) => ({
        ...category,
        class: colorClasses[index]
    }));

    // Sample data for the expenses vs budget chart
    const monthlyData = [
        { name: "Jan", expenses: 15000, budget: 20000 },
        { name: "Feb", expenses: 32000, budget: 40000 },
        { name: "Mar", expenses: 48000, budget: 60000 },
        { name: "Apr", expenses: 67000, budget: 80000 },
        { name: "May", expenses: 89000, budget: 100000 },
        { name: "Jun", expenses: 112000, budget: 120000 },
        { name: "Jul", expenses: 139000, budget: 140000 },
        { name: "Aug", expenses: 168000, budget: 160000 },
        { name: "Sep", expenses: 195000, budget: 180000 },
        { name: "Oct", expenses: 215000, budget: 200000 },
        { name: "Nov", expenses: 225000, budget: 220000 },
        { name: "Dec", expenses: 234000, budget: 240000 }
    ];

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

    return (
        <div className={styles.dashboard2Wrapper}>
            <section className={styles.dashboardContainer3}>
                <h3 className={styles.chartTitle}>Expenses VS Budget</h3>
                <div className={styles.chartContainer}>
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
                                name="Expenses Spent" 
                                stroke="#3B82F6" 
                                strokeWidth={2}
                                dot={{ r: 4, fill: "#3B82F6" }}
                                activeDot={{ r: 6 }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="budget" 
                                name="Budget Recommended" 
                                stroke="#10B981" 
                                strokeWidth={2}
                                dot={{ r: 4, fill: "#10B981" }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>

            <div className={styles.rowContainer}>
                <section className={styles.dashboardContainer4}>
                    <h4 className={styles.sectionTitle}>Total Expenses Spent</h4>
                    <div className={styles.totalExpenses}>RM 234,000.00</div>
                </section>

                <section className={styles.dashboardContainer5}>
                    <h4 className={styles.sectionTitle}>Top 5 Categories by Highest Expenses</h4>
                    
                    <div className={styles.categoriesContainer}>
                        {categoriesWithClasses.map((category, index) => (
                            <div key={index} className={styles.categoryBox}>
                                <div className={`${styles.categorySquare} ${category.class}`}></div>
                                <div className={styles.categoryName}>{category.name}</div>
                                <div className={styles.categoryAmount}>RM {category.amount.toLocaleString('en-MY', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}</div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default DashboardContainer;