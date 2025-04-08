import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; 
import ReceiptsView from "./ReceiptsView";
import styles from "./MonthlyExpensesView.module.css";

// Month names array defined outside the component to avoid recreation on each render
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function MonthlyExpensesView() {
    const location = useLocation();
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Get the year and month from URL only on component mount
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const yearParam = queryParams.get('year');
        const monthParam = queryParams.get('month');
        
        if (yearParam) {
            setYear(yearParam);
        }
        
        if (monthParam) {
            // Convert month number (1-12) to month name
            const monthIndex = parseInt(monthParam, 10) - 1;
            if (monthIndex >= 0 && monthIndex < 12) {
                setMonth(MONTH_NAMES[monthIndex]);
            }
        }
    }, [location.search]); // No need to include MONTH_NAMES since it's now outside the component

    // Fetch categories only once on component mount
    useEffect(() => {
        let isMounted = true;
        
        const fetchCategories = async () => {
            setIsLoading(true);
            try {
                const categoriesCollection = collection(db, "SystemCategory");
                const categorySnapshot = await getDocs(categoriesCollection);
                
                if (!isMounted) return;
                
                const categoryList = categorySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                setCategories(categoryList);
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchCategories();
        
        // Cleanup function to prevent state updates if component unmounts
        return () => {
            isMounted = false;
        };
    }, []);

    const handleCategoryChange = (e) => {
        setSelectedCategoryId(e.target.value);
    };

    return (
        <main className={styles.monthlyExpensesView}>
            {/* View By Section */}
            <div className={styles.viewBy}>
                <img src="/Calendar.png" alt="Calendar" width="40" height="40" />
                <span>{`${year} > ${month}`}</span>
            </div>

            {/* Dropdown Selection */}
            <div className={styles.viewDropdown}>
                <select 
                    name="category" 
                    id="category" 
                    className={styles.monthSelect}
                    value={selectedCategoryId}
                    onChange={handleCategoryChange}
                    disabled={isLoading}
                >
                    <option value="">- Select Category -</option>
                    {categories.map(category => (
                        <option key={category.categoryID || category.id} value={category.categoryID || category.id}>
                            {category.categoryName}
                        </option>
                    ))}
                </select>
                {isLoading && <span className={styles.loadingIndicator}>Loading...</span>}
            </div>

            {/* Receipts Grid */}
            <ReceiptsView 
                year={year} 
                month={month} 
                categoryId={selectedCategoryId}
            />
        </main>
    );
}

export default MonthlyExpensesView;