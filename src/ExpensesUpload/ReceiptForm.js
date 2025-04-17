import React, { useState, useEffect } from "react";
import styles from "./ReceiptForm.module.css";
import { getAuth } from "firebase/auth";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore";
import { db, storage } from "../firebase";

const ReceiptForm = ({ 
  uploadedFile, 
  extractedDate, 
  extractedTotal, 
  initialCategoryId,
  onClose, 
  isSavedReceipt,
  receiptId
}) => {
  const [transactionDate, setTransactionDate] = useState(extractedDate || "");
  const [totalAmount, setTotalAmount] = useState(extractedTotal || "");
  const [categoryId, setCategoryId] = useState(initialCategoryId || "");
  const [categories, setCategories] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const formattedTotalAmount = parseFloat(totalAmount).toFixed(2);

  const formatDate = (date) => {
    // Check if the date is already in YYYY-MM-DD format
    if (date && date.includes('-')) {
      return date;
    }
    
    // Otherwise, format from MM/DD/YYYY to YYYY-MM-DD
    if (date && date.includes('/')) {
      const [month, day, year] = date.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return date;
  };
  
  useEffect(() => {
    if (extractedDate) {
      setTransactionDate(formatDate(extractedDate));
    }
  }, [extractedDate]);

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
        
        // Set default category if we have categories and no initialCategoryId
        if (categoryList.length > 0 && !initialCategoryId) {
          setCategoryId(categoryList[0].id);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [initialCategoryId]);

  if (!uploadedFile) return null; // No file uploaded, don't show the form

  const handleClose = () => {
    if (onClose) onClose();
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
  
      if (!uploadedFile) return;
  
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.error("No user is signed in.");
        setIsSaving(false);
        return;
      }
  
      const userID = user.uid;
      
      // If this is an existing receipt being updated
      if (isSavedReceipt && receiptId) {
        const receiptRef = doc(db, "Receipt", receiptId);
        await updateDoc(receiptRef, {
          receiptTransDate: transactionDate,
          totalAmount: parseFloat(totalAmount),
          systemCategoryID: categoryId,
          updatedAt: new Date()
        });
      } else {
        // If this is a new receipt
        let downloadURL = uploadedFile;
        
        if (!isSavedReceipt) {
          const filename = `receipts/${userID}_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
          const storageRef = ref(storage, filename);
          await uploadString(storageRef, uploadedFile, "data_url");
          downloadURL = await getDownloadURL(storageRef);
        }
    
        await addDoc(collection(db, "Receipt"), {
          userID: userID,
          receiptURL: downloadURL,
          imageURL: downloadURL, // For backward compatibility
          receiptTransDate: transactionDate,
          totalAmount: parseFloat(totalAmount),
          systemCategoryID: categoryId,
          reliefCategoryID: "",
          isRelief: "No",
          createdAt: new Date(),
        });
      }
  
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        if (onClose) onClose();
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error saving receipt:", error);
    } finally {
      setIsSaving(false);
    }
  }; 
  
  const handleAmountChange = (e) => {
    setTotalAmount(e.target.value);
  };

  const handleCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;
    setCategoryId(selectedCategoryId);
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
                          <option key={category.id} value={category.id}>
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
                    value={formattedTotalAmount}
                    onChange={handleAmountChange}
                    className={styles.inputField}
                  />
                </div>
              </div>
              
              <button className={styles.saveButton} onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : (isSavedReceipt ? "Update" : "Save")}
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
          <p>The receipt is successfully {isSavedReceipt ? "updated" : "saved"}.</p>
        </div>
      </div>
    )}
    </>
  );
};

export default ReceiptForm;