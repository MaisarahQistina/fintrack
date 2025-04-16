import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Ensure Firebase setup is correctly imported
import TaxRelief from "./TaxRelief";
import styles from "./MonthlyExpensesView.module.css";

function TaxReliefFolder() {
    const [searchParams] = useSearchParams();
    const year = searchParams.get("year");

    // State for storing categories
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Fetch categories from Firestore on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoading(true);
            try {
                const categoriesCollection = collection(db, "SystemCategory");
                const categorySnapshot = await getDocs(categoriesCollection);
                const categoryList = categorySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setCategories(categoryList);
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleCategoryChange = (e) => {
        setSelectedCategoryId(e.target.value);
    };

    return (
        <main className={styles.monthlyExpensesView}>
            {/* View By Section */}
            {year && (
                <div className={styles.viewBy}>
                    <img src="/Calendar.png" alt="Calendar" width="40" height="40" />
                    <span>{`${year} > Tax Relief`}</span>
                </div>
            )}

            {/* Dropdown Selection for Categories */}
            <div className={styles.viewDropdown}>
                <select 
                    name="category" 
                    id="category" 
                    className={styles.monthSelect} 
                    value={selectedCategoryId} 
                    onChange={handleCategoryChange}
                    disabled={isLoading} // Disable dropdown while loading
                >
                    <option value="">- Select Category -</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.categoryName}
                        </option>
                    ))}
                </select>
                {isLoading && <span className={styles.loadingIndicator}></span>}

                <button className={styles.reliefDownload}>
                    <img src="/download.png" alt="Download" style={{ width: "16px", height: "16px" }} />
                    Download
                </button>
            </div>

            {/* Receipts Grid */}
            <TaxRelief year={year} categoryId={selectedCategoryId} />
        </main>
    );
}

export default TaxReliefFolder;
