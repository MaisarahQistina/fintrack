import React, { useState } from "react";
import styles from "./ReliefForm.module.css";

const NewReliefForm = ({ onClose }) => {
  const [reliefCategory, setReliefCategory] = useState(""); // Initially empty
  const [reliefLimit, setReliefLimit] = useState(""); // Initially empty
  const [applicableYear, setApplicableYear] = useState(""); // Initially empty
  const [systemCategory, setSystemCategory] = useState(""); // Initially empty
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClose = () => {
    if (onClose) onClose();
  };

  const handleSave = () => {
    if (!reliefCategory || !reliefLimit || !applicableYear || !systemCategory) {
        alert("All fields are required. Please fill in all fields."); // Set error message
        return; // Prevent form submission
      }

    console.log("Saving new relief data:", {
      reliefCategory,
      reliefLimit,
      applicableYear,
      systemCategory,
    });
    
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      handleClose(); // Close the form after saving
    }, 2000);
  };

  return (
    <>
      <div className={styles.popupFormOverlay} onClick={handleClose}>
        <div className={styles.popupFormContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.form}>
            <div className={styles.formTitle}>
              <h1 className={styles.cardTitle}>Add New Tax Relief Category</h1>
              <p>Fill in the details for the new category.</p>
              <span className={styles.closeBtn} onClick={handleClose}>X</span>
            </div>
            
            <div className={styles.formBody}>
              <div className={styles.formFields}>
                <div className={styles.formGroup}>
                  <label htmlFor="reliefCategory">Relief Category</label>
                  <input
                    type="text"
                    id="reliefCategory"
                    value={reliefCategory}
                    onChange={(e) => setReliefCategory(e.target.value)}
                    className={styles.inputField}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="reliefLimit">Relief Limit</label>
                  <input
                    type="text"
                    id="reliefLimit"
                    value={reliefLimit}
                    onChange={(e) => setReliefLimit(e.target.value)}
                    className={styles.inputField}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="applicableYear">Applicable Year</label>
                  <input
                    type="number"
                    id="applicableYear"
                    value={applicableYear}
                    onChange={(e) => setApplicableYear(e.target.value)}
                    className={styles.inputField}
                  />
                </div>

                 {/* NANTI TUKAR DROPDOWN */}
                <div className={styles.formGroup}>
                  <label htmlFor="systemCategory">System Category</label>
                  <input
                    type="text"
                    id="systemCategory"
                    value={systemCategory}
                    onChange={(e) => setSystemCategory(e.target.value)}
                    className={styles.inputField}
                  />
                </div>
                
                <button className={styles.saveButton} onClick={handleSave}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className={styles.popupOverlay} onClick={() => setShowSuccess(false)}>
          <div className={styles.popupConfirmation} onClick={(e) => e.stopPropagation()}>
            <img src="/Checkmark.png" alt="Checkmark" width="60" height="60" />
            <p>The new category has been successfully added.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default NewReliefForm;
