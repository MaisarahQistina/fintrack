import React from "react";
import FeedbackTable from "./FeedbackTable";
import styles from "./FeedbackPage.module.css";

function FeedbackPage() {
  return (
    <>
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Feedbacks</h1>
          <FeedbackTable />
        </main>
      </div>
    </>
  );
}

export default FeedbackPage;
