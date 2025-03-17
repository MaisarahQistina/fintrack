import React from "react";
import styles from "./Dashboard.module.css"; // Keep same CSS file

function DashboardContainer() {
    // Sample data for top 5 categories
    const topCategories = [
        { name: "Housing", amount: 96500.00, class: styles.category1 },
        { name: "Food", amount: 54300.00, class: styles.category2 },
        { name: "Transport", amount: 38500.00, class: styles.category3 },
        { name: "Shopping", amount: 25800.00, class: styles.category4 },
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

    return (
        <div className={styles.dashboard2Wrapper}>
            <section className={styles.dashboardContainer3}>
                Expenses VS Budget
            </section>

            <div className={styles.rowContainer}>
                <section className={styles.dashboardContainer4}>
                    Total Expenses Spent
                    <div className={styles.totalExpenses}>RM 234000.00</div>
                </section>

                <section className={styles.dashboardContainer5}>
                    Top 5 Categories by Highest Expenses
                    
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