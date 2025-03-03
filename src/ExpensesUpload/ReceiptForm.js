// ReceiptForm.js
import React, { useState } from "react";
import styles from "./ReceiptForm.module.css";

const ReceiptForm = ({ uploadedFile, onClose, isSavedReceipt }) => {
  const [transactionDate, setTransactionDate] = useState("2024-04-01");
  const [category, setCategory] = useState("Medical Expenses");
  const [totalAmount, setTotalAmount] = useState("RM 33.26");
  const [showSuccess, setShowSuccess] = useState(false);

  if (!uploadedFile) return null; // No file uploaded, don't show the form

  const handleClose = () => {
    if (onClose) onClose();
  };

  const handleSave = () => {
    // Save logic here
    console.log("Saving receipt data:", {
      transactionDate,
      category,
      totalAmount
    });
    
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      handleClose(); // Close the main form
    }, 2000);
  };

  const handleAmountChange = (e) => {
    setTotalAmount(e.target.value);
  };

  return (
    <>
    <div className={styles.popupOverlay} onClick={handleClose}>
      <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.form}>
          <div className={styles.formTitle}>
            <h1 className={styles.receiptTitle}>Manage Your Receipt Details</h1>
            <p>View your receipt details. You may update them if needed.</p>
            <span className={styles.closeBtn} onClick={handleClose}>X</span>
          </div>
          
          <div className={styles.formBody}>
            <div className={styles.receiptImage}>
              <div className={styles.imageContainer}>
                {uploadedFile && (
                    <img
                    src={
                      isSavedReceipt
                        ? uploadedFile // Use URL directly if it's a saved receipt
                        : URL.createObjectURL(uploadedFile) // Use file object URL if newly uploaded
                    }
                    alt="Uploaded Receipt"
                    className={styles.uploadedImage}
                  />
                )}
              </div>
            </div>
            
            <div className={styles.formFields}>
              <div className={styles.formGroup}>
                <label htmlFor="transactionDate">Transaction Date</label>
                <div className={styles.inputWithIcon}>
                  <input 
                    type="date" 
                    id="transactionDate" 
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className={styles.inputField}
                  />
                  <i className={styles.calendarIcon}></i>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="category">Category(s)</label>
                <div className={styles.selectWrapper}>
                  <select 
                    id="category" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={styles.inputField}
                  >
                    <option>Medical Expenses</option>
                    <option>Food & Beverage</option>
                    <option>Transport</option>
                    <option>Entertainment</option>
                  </select>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="totalAmount">Total Amount</label>
                <div className={styles.inputWithIcon}>
                  <input 
                    type="text" 
                    id="totalAmount" 
                    value={totalAmount}
                    onChange={handleAmountChange}
                    className={styles.inputField}
                  />
                </div>
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
          <p>The receipt is successfully saved.</p>
        </div>
      </div>
    )}
    </>
  );
};

export default ReceiptForm;