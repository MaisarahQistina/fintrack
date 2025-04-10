import React, { useState, useEffect } from "react";
import styles from "./ReceiptForm.module.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Make sure to import your Firestore instance

const ReceiptForm = ({ uploadedFile, onClose, isSavedReceipt }) => {
  const [transactionDate, setTransactionDate] = useState("2024-04-01");
  const [categoryId, setCategoryId] = useState(""); // Store ID instead of name
  const [categoryName, setCategoryName] = useState(""); // For display purposes
  const [categories, setCategories] = useState([]); // To store categories from Firestore
  const [totalAmount, setTotalAmount] = useState("RM 33.26");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories from Firestore when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const categoriesCollection = collection(db, "SystemCategory");
        const categorySnapshot = await getDocs(categoriesCollection);
        const categoryList = categorySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setCategories(categoryList);
        
        // Set default category if we have categories
        if (categoryList.length > 0) {
          setCategoryId(categoryList[0].categoryID);
          setCategoryName(categoryList[0].categoryName);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (!uploadedFile) return null; // No file uploaded, don't show the form

  const handleClose = () => {
    if (onClose) onClose();
  };

  const handleSave = () => {
    // Save logic here
    console.log("Saving receipt data:", {
      transactionDate,
      categoryId, // Save the ID rather than the name
      categoryName, // Just for display/debugging
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

  const handleCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;
    setCategoryId(selectedCategoryId);
    
    // Find the corresponding category name for display
    const selectedCategory = categories.find(cat => cat.categoryID === selectedCategoryId);
    if (selectedCategory) {
      setCategoryName(selectedCategory.categoryName);
    }
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
                  src={uploadedFile} 
                  alt="Uploaded receipt" 
                  // className={styles.uploadedImage}
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
                  {isLoading ? (
                    <div>Loading categories...</div>
                  ) : (
                    <select 
                      id="category" 
                      value={categoryId}
                      onChange={handleCategoryChange}
                      className={styles.inputField}
                    >
                      {categories.length > 0 ? (
                        categories.map(category => (
                          <option key={category.categoryID} value={category.categoryID}>
                            {category.categoryName}
                          </option>
                        ))
                      ) : (
                        <option value="">No categories available</option>
                      )}
                    </select>
                  )}
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