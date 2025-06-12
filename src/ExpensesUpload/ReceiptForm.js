import React, { useState, useEffect } from "react";
import styles from "./ReceiptForm.module.css";
import { getAuth } from "firebase/auth";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { collection, addDoc, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db, storage } from "../firebase";

const ReceiptForm = ({ 
  uploadedFile, 
  extractedDate, 
  extractedTotal, 
  extractedLineItems = [],
  initialCategoryId,
  initialIsReliefEligible,
  initialReliefCategoryID,
  initialReliefExplanation,
  initialMatchingReliefCategory,
  onClose, 
  isSavedReceipt,
  receiptId
}) => {
  // State initialization - make sure to handle empty/null values properly
  const [transactionDate, setTransactionDate] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Tax relief related states
  const [isReliefEligible, setIsReliefEligible] = useState(initialIsReliefEligible || "No");
  const [reliefCategoryId, setReliefCategoryId] = useState(initialReliefCategoryID || "");
  const [reliefExplanation, setReliefExplanation] = useState(initialReliefExplanation || "");
  const [matchingReliefCategory, setMatchingReliefCategory] = useState(initialMatchingReliefCategory || "");
  const [reliefCategories, setReliefCategories] = useState([]);
  const [showReliefDetails, setShowReliefDetails] = useState(false);
  const [lineItems, setLineItems] = useState(extractedLineItems || []);
  const [isCheckingRelief, setIsCheckingRelief] = useState(false);

  const formatDate = (date) => {
    if (!date) return "";
    
    // Check if the date is already in YYYY-MM-DD format
    if (date.includes('-') && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date;
    }
    
    // Otherwise, format from MM/DD/YYYY to YYYY-MM-DD
    if (date.includes('/')) {
      const [month, day, year] = date.split('/');
      if (month && day && year) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    return date;
  };
  
  // Initialize form data after component mounts and categories are loaded
  useEffect(() => {
    const initializeFormData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch main categories
        const categoriesCollection = collection(db, "SystemCategory");
        const categorySnapshot = await getDocs(categoriesCollection);
        const categoryList = categorySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setCategories(categoryList);
        
        // Fetch relief categories
        const reliefCategoriesCollection = collection(db, "ReliefCategory");
        const reliefSnapshot = await getDocs(reliefCategoriesCollection);
        const reliefList = reliefSnapshot.docs
          .filter(doc => doc.data().isActive)
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        
        setReliefCategories(reliefList);
        
        // Initialize form values AFTER categories are loaded
        if (isSavedReceipt && receiptId) {
          // Load existing receipt data
          const receiptRef = doc(db, "Receipt", receiptId);
          const receiptSnap = await getDoc(receiptRef);
          
          if (receiptSnap.exists()) {
            const receiptData = receiptSnap.data();
            
            // Set form values from saved receipt
            setTransactionDate(receiptData.receiptTransDate || "");
            setTotalAmount(receiptData.totalAmount?.toString() || "");
            setCategoryId(receiptData.systemCategoryID || "");
            
            // // Update relief related fields
            if (receiptData.isRelief) {
              setIsReliefEligible(receiptData.isRelief);
              setShowReliefDetails(receiptData.isRelief === "Yes");
            }
            
            if (receiptData.reliefCategoryID) {
              setReliefCategoryId(receiptData.reliefCategoryID);
            }
            
            if (receiptData.reliefExplanation) {
              setReliefExplanation(receiptData.reliefExplanation);
            }
            
            if (receiptData.lineItems && receiptData.lineItems.length > 0) {
              setLineItems(receiptData.lineItems);
            }
          }
        } else {
          // Initialize with extracted/passed values for new receipts
          setTransactionDate(formatDate(extractedDate) || "");
          setTotalAmount(extractedTotal || "");
          setCategoryId(initialCategoryId || (categoryList.length > 0 ? categoryList[0].id : ""));
        }
        
        // Set relief details visibility
        if (initialIsReliefEligible === "Yes") {
          setShowReliefDetails(true);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    initializeFormData();
  }, [extractedDate, extractedTotal, initialCategoryId, isSavedReceipt, receiptId, initialIsReliefEligible]);

  if (!uploadedFile) return null; // No file uploaded, don't show the form

  const handleClose = () => {
    if (onClose) onClose();
    window.location.reload();
  };

  // Fixed event handlers to ensure state updates properly
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    console.log("Date changed to:", newDate); // Debug log
    setTransactionDate(newDate);
  };

  const handleAmountChange = (e) => {
    const newAmount = e.target.value;
    console.log("Amount changed to:", newAmount); // Debug log
    setTotalAmount(newAmount);
  };

  const handleCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;
    console.log("Category changed to:", selectedCategoryId); // Debug log
    setCategoryId(selectedCategoryId);
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
      
      // Debug: Log current form state before saving
      console.log("=== SAVING RECEIPT ===");
      console.log("Transaction Date:", transactionDate);
      console.log("Total Amount:", totalAmount);
      console.log("Category ID:", categoryId);
      console.log("Is Relief Eligible:", isReliefEligible);
      
      // Prepare the data to save with current form state
      const receiptData = {
        receiptTransDate: transactionDate, // Use current state value
        totalAmount: parseFloat(totalAmount) || 0,
        systemCategoryID: categoryId, // Use current state value
        isRelief: isReliefEligible,
        reliefCategoryID: reliefCategoryId || "",
        reliefExplanation: reliefExplanation || "",
        matchingReliefCategory: matchingReliefCategory || "",
        updatedAt: new Date()
      };

      console.log("Receipt data to save:", receiptData);

      // Save logic remains the same
      if (isSavedReceipt && receiptId) {
        const receiptRef = doc(db, "Receipt", receiptId);
        await updateDoc(receiptRef, receiptData);
        console.log("Receipt updated successfully");
      } else {
        let downloadURL = uploadedFile;
        
        if (!isSavedReceipt) {
          const filename = `receipts/${userID}_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
          const storageRef = ref(storage, filename);
          await uploadString(storageRef, uploadedFile, "data_url");
          downloadURL = await getDownloadURL(storageRef);
        }

        receiptData.userID = userID;
        receiptData.receiptURL = downloadURL;
        receiptData.imageURL = downloadURL;
        receiptData.createdAt = new Date();

        const docRef = await addDoc(collection(db, "Receipt"), receiptData);
        console.log("New receipt created with ID:", docRef.id);
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

  const handleCheckReliefEligibility = async () => {
    try {
      setIsCheckingRelief(true);
      
      const response = await fetch('http://localhost:5000/check-relief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lineItems: lineItems,
          receiptId: receiptId || null
        }),
      });
      
      const result = await response.json();
      
      if (result.error) {
        console.error("Error checking relief eligibility:", result.error);
        return;
      }
      
      setIsReliefEligible(result.eligible ? "Yes" : "No");
      setReliefCategoryId(result.reliefCategoryID || "");
      setReliefExplanation(result.explanation || "");
      setMatchingReliefCategory(result.matchingCategory || "");
      setShowReliefDetails(true);
      
    } catch (error) {
      console.error("Error checking relief eligibility:", error);
    } finally {
      setIsCheckingRelief(false);
    }
  };
  
  const getReliefCategoryName = (id) => {
    const category = reliefCategories.find(cat => cat.id === id);
    return category ? category.reliefCategory : "Unknown";
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
                    onChange={handleDateChange} // Use the fixed handler
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
                        onChange={handleCategoryChange} // Use the fixed handler
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
                      type="number" 
                      id="totalAmount" 
                      value={totalAmount}
                      onChange={handleAmountChange} // Use the fixed handler
                      className={styles.inputField}
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="reliefStatus">Tax Relief Status</label>
                  <div>
                    <input 
                      type="text" 
                      id="reliefStatus" 
                      value={isReliefEligible === "Yes" 
                        ? `Eligible${reliefCategoryId ? ` (${getReliefCategoryName(reliefCategoryId)})` : ''}`
                        : "Not Eligible"
                      }
                      readOnly
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

      <input type="hidden" value={showReliefDetails} />
      <input type="hidden" value={isCheckingRelief} />
      <input type="hidden" value={handleCheckReliefEligibility} />

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