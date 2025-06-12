import React, { useState, useEffect } from "react";
import styles from "./UserProfile.module.css";
import { doc, getDoc, updateDoc } from "firebase/firestore"; // Firebase Firestore
import { auth, db } from "../firebase"; // Firebase setup

const UserProfile = () => {
  const [userData, setUserData] = useState(null); // Store user data
  const [monthlyIncome, setMonthlyIncome] = useState(""); // For updating monthly income
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = auth.currentUser.uid; // Get the logged-in user's ID
        const userDoc = await getDoc(doc(db, "User", userId)); // Fetch user's data from Firestore

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data); // Set fetched data
          setMonthlyIncome(data.monthlyIncome || ""); // Set monthly income (default to empty if not present)
        } else {
          console.error("User document not found.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Handle saving/updating monthly income
  const handleSave = async () => {
    try {
      const userId = auth.currentUser.uid; 
      const userRef = doc(db, "User", userId); 

      // Update the "monthlyIncome" field in Firestore
      await updateDoc(userRef, {
        monthlyIncome,
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error updating monthly income:", error);
    }
  };

  if (loading) {}

  return (
    <>
      <main className={styles.ProfileView}>
        <div className={styles.title}>User Profile</div>
        <div className={styles.form}>
          <div className={styles.formBody}>
            <div className={styles.formFields}>
              <div className={styles.formGroup}>
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  value={userData?.fullName || ""}
                  className={styles.inputField}
                  readOnly // Prevent editing
                />
              </div>

              {/* Email Address (read-only) */}
              <div className={styles.formGroup}>
                <label htmlFor="email">Email Address</label>
                <input
                  type="text"
                  id="email"
                  value={userData?.email || ""}
                  className={styles.inputField}
                  readOnly // Prevent editing
                />
              </div>

              {/* Date of Birth (read-only) */}
              <div className={styles.formGroup}>
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  type="text"
                  id="dateOfBirth"
                  value={userData?.dob || ""}
                  className={styles.inputField}
                  readOnly // Prevent editing
                />
              </div>

              {/* Monthly Income (editable) */}
              <div className={styles.formGroup}>
              <label htmlFor="monthlyIncome">Monthly Income</label>
                <div className={styles.inputWithIcon}>
                    <input
                    type="number"
                    id="monthlyIncome"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)} // Allow editing
                    className={styles.inputField}
                    />
                    <img 
                    src="/penIcon.png" 
                    alt="Edit" 
                    className={styles.inputIcon} 
                    />
                </div>   
              </div>           

              {/* Save Button */}
              <button className={styles.saveButton} onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Success Popup */}
        {showSuccess && (
          <div className={styles.popupOverlay} onClick={() => setShowSuccess(false)}>
            <div className={styles.popupConfirmation} onClick={(e) => e.stopPropagation()}>
              <img src="/Checkmark.png" alt="Checkmark" width="60" height="60" />
              <p>Monthly income updated successfully.</p>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default UserProfile;
