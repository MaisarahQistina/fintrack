import React, { useState } from "react";
import { db } from "../firebase"; // Your Firestore configuration
import { collection, addDoc } from "firebase/firestore";
import styles from "./Feedback.module.css";

function FeedbackPage({ user }) { // Assuming you pass userId as a prop
  const [feedback, setFeedback] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmitClick = async () => {
    if (!feedback.trim()) {
      alert("Please enter feedback before submitting.");
      return;
    }

    try {
      // Add feedback document to the "feedback" collection in Firestore
      const feedbackCollection = collection(db, "Feedback");
      await addDoc(feedbackCollection, {
        userId: user,
        feedback: feedback.trim(),
        timestamp: new Date(), // Optional: Log when the feedback was submitted
      });

      // Show popup
      setShowPopup(true);
      setFeedback(""); // Clear feedback field after submission

      // Hide popup automatically after 2 seconds
      setTimeout(() => setShowPopup(false), 2000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("An error occurred while submitting your feedback.");
    }
  };

  return (
    <>
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Give us feedback!</h1>
          <div className={styles.subtitle}>
            Your input is important to us. We take our user feedback very seriously.
          </div>
          <textarea
            className={styles.feedbackBox}
            placeholder="Add your feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          ></textarea>

          {/* Buttons */}
          <div className={styles.buttonWrapper}>
            <button className={styles.cancelButton} onClick={() => setFeedback("")}>
              Cancel
            </button>
            <button
              className={styles.submitButton}
              onClick={handleSubmitClick}
            >
              Submit
            </button>
          </div>
        </main>
      </div>

      {/* Popup */}
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
            <img src="/Checkmark.png" alt="Checkmark" width="60" height="60" />
            <p>Thank you for your feedback!</p>
          </div>
        </div>
      )}
    </>
  );
}

export default FeedbackPage;
