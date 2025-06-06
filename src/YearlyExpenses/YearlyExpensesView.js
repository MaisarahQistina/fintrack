import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase"; // Adjust this import to your Firebase setup
import MonthsRow from "./MonthsRow";
import styles from "./YearlyExpensesView.module.css";

const firstHalfMonths = ["January", "February", "March", "April", "May", "June"];
const secondHalfMonths = ["July", "August", "September", "October", "November", "December"];

function YearlyExpensesView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [year, setYear] = useState(new Date().getFullYear().toString()); // Default to current year
  const [receiptCounts, setReceiptCounts] = useState({});
  const [taxReliefCount, setTaxReliefCount] = useState(0);
  
  useEffect(() => {
    // Get the year from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const yearParam = queryParams.get('year');
    
    if (yearParam) {
      setYear(yearParam);
    }
    
    // Fetch receipts for the specified year
    fetchReceiptCountsByMonth(yearParam || year);
    fetchTaxReliefCount(yearParam || year);
  }, [location.search, year]);

  const fetchReceiptCountsByMonth = async (year) => {
    try {
      // Initialize counts for all months
      const monthsCount = {
        January: 0, February: 0, March: 0, April: 0, May: 0, June: 0,
        July: 0, August: 0, September: 0, October: 0, November: 0, December: 0
      };
      
      // Reference to the Receipt collection
      const receiptsRef = collection(db, "Receipt");
      
      // Fetch all receipts - we'll filter by year in memory
      // This is because Firestore has limitations on inequality filters on different fields
      const receiptsSnapshot = await getDocs(receiptsRef);
      
      // Count receipts by month for the specific year
      receiptsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.receiptTransDate) {
          let date;
          
          // Handle Firestore timestamp
          if (data.receiptTransDate.toDate) {
            date = data.receiptTransDate.toDate();
          } 
          // Handle date string
          else if (typeof data.receiptTransDate === 'string') {
            date = new Date(data.receiptTransDate);
          }
          // Handle if it's already a Date object
          else if (data.receiptTransDate instanceof Date) {
            date = data.receiptTransDate;
          }
          
          if (date && date.getFullYear().toString() === year) {
            const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
            monthsCount[monthName]++;
          }
        }
      });
      
      console.log("Receipt counts by month for year", year, ":", monthsCount);
      setReceiptCounts(monthsCount);
    } catch (error) {
      console.error("Error fetching receipt counts:", error);
      // Initialize empty counts in case of error
      setReceiptCounts({
        January: 0, February: 0, March: 0, April: 0, May: 0, June: 0,
        July: 0, August: 0, September: 0, October: 0, November: 0, December: 0
      });
    }
  };

  const fetchTaxReliefCount = async (year) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("No user is signed in.");
        setTaxReliefCount(0);
        return;
      }

      const userID = user.uid;
      
      // Reference to the Receipt collection
      const receiptsRef = collection(db, "Receipt");
      const receiptsSnapshot = await getDocs(receiptsRef);
      
      let count = 0;
      
      // Count tax relief receipts for the specific year and user
      receiptsSnapshot.forEach((doc) => {
        const data = doc.data();
        const receiptDateStr = data.receiptTransDate || data.transactionDate;
        const isUserMatch = data.userID === userID;
        const isTaxRelief = data.isRelief === "Yes";
        
        if (receiptDateStr && isUserMatch && isTaxRelief) {
          let date;
          
          // Handle different date formats
          if (receiptDateStr.toDate) {
            date = receiptDateStr.toDate();
          } else if (typeof receiptDateStr === 'string') {
            date = new Date(receiptDateStr);
          } else if (receiptDateStr instanceof Date) {
            date = receiptDateStr;
          }
          
          if (date && date.getFullYear().toString() === year) {
            count++;
          }
        }
      });
      
      console.log("Tax relief receipt count for year", year, ":", count);
      setTaxReliefCount(count);
    } catch (error) {
      console.error("Error fetching tax relief count:", error);
      setTaxReliefCount(0);
    }
  };

  const handleTaxReliefClick = () => {
    navigate(`/tax-relief?year=${year}`);
  };

  return (
    <main className={styles.yearlyExpensesView}>
      <div className={styles.viewBy}>
        <img src="/Calendar.png" alt="Calendar" width="40" height="10" /> {year}
      </div>

      <section className={styles.monthsContainer}>
        <MonthsRow months={firstHalfMonths} year={year} receiptCounts={receiptCounts} />
        <MonthsRow months={secondHalfMonths} year={year} receiptCounts={receiptCounts} />
      </section>

      {/* Tax Relief Folder */}
      <div className={styles.taxRelief} onClick={handleTaxReliefClick} style={{ cursor: "pointer" }}>
        <img src="/taxFolder.png" alt="Folder Icon" />
        <div>
          <span>Tax Relief</span><br></br>
          <div className={styles.taxCounter}>Total: {taxReliefCount}</div>
        </div>
      </div>
    </main>
  );
}

export default YearlyExpensesView;