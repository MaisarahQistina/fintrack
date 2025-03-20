import React, { useState } from "react";
import styles from "./ReliefForm.module.css";

const EditReliefForm = ({ reliefDetails, onClose }) => {
  const [reliefLimit, setReliefLimit] = useState(reliefDetails.reliefLimit);
  const [applicableYear, setApplicableYear] = useState(reliefDetails.applicableYear);
  const [systemCategory, setSystemCategory] = useState(reliefDetails.systemCategory);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClose = () => {
    if (onClose) onClose();
  };

  const handleSave = () => {
    console.log("Saving edited relief data:", {
        id: reliefDetails.id,
        reliefCategory: reliefDetails.reliefCategory,
        reliefLimit,
        applicableYear,
        systemCategory,
      });
    
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      handleClose(); // Close the main form
    }, 2000);
  };

  return (
    <>
    <div className={styles.popupFormOverlay} onClick={handleClose}>
      <div className={styles.popupFormContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.form}>
          <div className={styles.formTitle}>
            <h1 className={styles.cardTitle}>Edit Tax Relief Category</h1>
            <p>Ensure the relief limit reflects the latest policy changes.</p>
            <span className={styles.closeBtn} onClick={handleClose}>X</span>
          </div>
          
          <div className={styles.formBody}>
            <div className={styles.infoImage}>
            </div>
            
            <div className={styles.formFields}>
              <div className={styles.formGroup}>
              <label htmlFor="id">ID</label>
                <input
                  type="text"
                  id="id"
                  value={reliefDetails.id}
                  className={styles.inputField}
                  readOnly
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="reliefCategory">Relief Category</label>
                <input
                  type="text"
                  id="reliefCategory"
                  value={reliefDetails.reliefCategory}
                  className={styles.inputField}
                  readOnly
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
          <p>The category is successfully updated.</p>
        </div>
      </div>
    )}
    </>
  );
};

export default EditReliefForm;