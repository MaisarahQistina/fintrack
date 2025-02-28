import React from "react";
import styles from "./FeedbackTable.module.css";

function FeedbackTable() {
  // Sample data for the table
  const feedbackData = [
    { id: 1, userId: "User123", feedback: "Great service!" },
    { id: 2, userId: "User456", feedback: "The app is very intuitive." },
    { id: 3, userId: "User789", feedback: "Could use more features." },
    { id: 4, userId: "User101", feedback: "Very helpful for tax planning." },
    { id: 5, userId: "User202", feedback: "Love the interface design." },
    { id: 6, userId: "User303", feedback: "Needs better mobile support." },
    { id: 7, userId: "User404", feedback: "Excellent customer service." },
    { id: 8, userId: "User505", feedback: "Would recommend to others." },
    { id: 9, userId: "User606", feedback: "Helped me save on taxes." },
    { id: 10, userId: "User707", feedback: "Easy to navigate." },
    { id: 11, userId: "User808", feedback: "Could use more detailed reports." },
    { id: 12, userId: "User909", feedback: "Very satisfied with the service." },
  ];

  return (
    <div className={styles.table}>
      <div className={styles.tableHeader}>
        <div className={styles.headerCell}>No.</div>
        <div className={styles.headerCell}>User ID</div>
        <div className={styles.headerCell}>Feedback</div>
      </div>
      {feedbackData.map((item, index) => (
        <div
          key={item.id}
          className={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
        >
          <div className={styles.cell}>{item.id}</div>
          <div className={styles.cell}>{item.userId}</div>
          <div className={styles.cell}>{item.feedback}</div>
        </div>
      ))}
    </div>
  );
}

export default FeedbackTable;
