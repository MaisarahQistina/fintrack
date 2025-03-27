import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase"; // Import your Firestore configuration
import styles from "./FeedbackTable.module.css";

function FeedbackTable() {
  const [feedbackData, setFeedbackData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        // Fetch feedback collection from Firestore
        const feedbackCollection = collection(db, "Feedback");
        const feedbackSnapshot = await getDocs(feedbackCollection);

        // Map data into an array
        const feedbackList = feedbackSnapshot.docs.map((doc, index) => ({
          id: index + 1, // Add a sequential ID
          userId: doc.data().userId,
          feedback: doc.data().feedback,
          timestamp: doc.data().timestamp
          ? doc.data().timestamp.toDate().toLocaleString() // Convert Firebase Timestamp
          : "N/A",
        }));

        setFeedbackData(feedbackList); // Set data in state
        setLoading(false); // Stop loading
      } catch (error) {
        console.error("Error fetching feedback data:", error);
      }
    };

    fetchFeedback();
  }, []);

  if (loading) {
    return <p>Loading feedback...</p>;
  }

  return (
    <div className={styles.table}>
      <div className={styles.tableHeader}>
        <div className={styles.headerCell}>No.</div>
        <div className={styles.headerCell}>User ID</div>
        <div className={styles.headerCell}>Feedback</div>
        <div className={styles.headerCell}>Timestamp</div>
      </div>
      {feedbackData.map((item, index) => (
        <div
          key={index}
          className={index % 3 === 0 ? styles.tableRow : styles.tableRowAlt}
        >
          <div className={styles.cell}>{item.id}</div>
          <div className={styles.cell}>{item.userId}</div>
          <div className={styles.cell}>{item.feedback}</div>
          <div className={styles.cell}>{item.timestamp}</div>
        </div>
      ))}
    </div>
  );
}

export default FeedbackTable;
