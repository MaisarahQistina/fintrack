import React from "react";
import FeedbackTable from "./FeedbackTable";
import styles from "./FeedbackPage.module.css";

function FeedbackPage() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Abhaya+Libre:wght@700&family=NATS&display=swap"
        rel="stylesheet"
      />
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
