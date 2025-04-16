import React, { useState, useEffect } from "react";
import styles from "./MonthlyExpensesView.module.css";
import ReceiptForm from "../ExpensesUpload/ReceiptForm";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";

const ReceiptsView = ({ year, month, categoryId }) => {
  const [receipts, setReceipts] = useState([]);
  const [categoriesMap, setCategoriesMap] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptToDelete, setReceiptToDelete] = useState(null);

  // Fetch categories and receipts based on props
  useEffect(() => {
    const fetchData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
  
        if (!user) {
          console.error("No user is signed in.");
          return;
        }
  
        const userID = user.uid;
  
        // Fetch categories
        const categorySnapshot = await getDocs(collection(db, "SystemCategory"));
        const categoryData = {};
        categorySnapshot.forEach(doc => {
          categoryData[doc.id] = doc.data().categoryName;
        });
        setCategoriesMap(categoryData);
  
        // Fetch all receipts
        const receiptSnapshot = await getDocs(collection(db, "Receipt"));
        const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
        const filteredReceipts = [];
  
        receiptSnapshot.forEach(doc => {
          const receipt = doc.data();
  
          const receiptDateStr = receipt.receiptTransDate || receipt.transactionDate;
          const isUserMatch = receipt.userID === userID;
  
          if (receiptDateStr && isUserMatch) {
            const receiptDate = new Date(receiptDateStr);
            const receiptMonth = receiptDate.getMonth();
            const receiptYear = receiptDate.getFullYear();
  
            const matchMonth = receiptMonth === monthIndex;
            const matchYear = receiptYear === parseInt(year);
            const matchCategory = !categoryId || receipt.systemCategoryID === categoryId;
  
            if (matchMonth && matchYear && matchCategory) {
              filteredReceipts.push({
                id: doc.id,
                ...receipt
              });
            }
          }
        });
  
        setReceipts(filteredReceipts);
      } catch (error) {
        console.error("Error fetching receipts:", error);
      }
    };
  
    if (year && month) {
      fetchData();
    }
  }, [year, month, categoryId]);  

  const handleDeleteClick = (receipt) => {
    setReceiptToDelete(receipt);
    setShowPopup(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (receiptToDelete && receiptToDelete.id) {
        // Delete the document from Firestore
        await deleteDoc(doc(db, "Receipt", receiptToDelete.id));
        
        // Update local state by removing the deleted receipt
        setReceipts((prevReceipts) => 
          prevReceipts.filter(receipt => receipt.id !== receiptToDelete.id)
        );
      }
      
      setShowPopup(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Error deleting receipt:", error);
      setShowPopup(false);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setReceiptToDelete(null);
  };

  const handleViewClick = (receipt) => {
    setSelectedReceipt(receipt);
  };

  const handleCloseForm = () => {
    setSelectedReceipt(null);
  };

  return (
    <>
      <div className={styles.receiptsContainer}>
        {receipts.length === 0 && (
          <p style={{ textAlign: "center", marginTop: "2rem", whiteSpace: "nowrap" }}>
            No receipts found for {month} {year} {categoryId ? ' in the selected category' : ''}.
          </p>       
        )}
        {receipts.map((receipt) => (
          <div key={receipt.id} className={styles.card}>
            <div className={styles.imageContainer}>
              <img 
                src={receipt.imageURL || receipt.receiptURL} 
                alt="Receipt" 
                className={styles.image} 
              />
            </div>

            {/* Category Section */}
            <h3 className={styles.title}>Category:</h3>
            <div className={styles.categoryWrapper}>
              <div className={styles.categoryScroll}>
                <span className={styles.categoryLabel}>
                  {categoriesMap[receipt.systemCategoryID] || "Unknown"}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className={styles.buttonWrapper}>
              <button className={styles.viewButton} onClick={() => handleViewClick(receipt)}>
                View
              </button>
              <button className={styles.deleteButton} onClick={() => handleDeleteClick(receipt)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showPopup && (
        <div className={styles.popupOverlay} onClick={closePopup}>
          <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
            <p>Are you sure you want to delete this receipt?</p>
            <div className={styles.buttonWrapper}>
              <button className={styles.cancelButton} onClick={closePopup}>
                Cancel
              </button>
              <button className={styles.confirmButton} onClick={handleConfirmDelete}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className={styles.popupOverlay} onClick={() => setShowSuccess(false)}>
          <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
            <img src="/Checkmark.png" alt="Checkmark" width="60" height="60" />
            <p>The receipt is successfully deleted.</p>
          </div>
        </div>
      )}

      {selectedReceipt && (
        <ReceiptForm
          uploadedFile={selectedReceipt.imageURL || selectedReceipt.receiptURL}
          extractedDate={selectedReceipt.receiptTransDate || selectedReceipt.transactionDate}
          extractedTotal={selectedReceipt.totalAmount ? selectedReceipt.totalAmount.toString() : ""}
          initialCategoryId={selectedReceipt.systemCategoryID}
          onClose={handleCloseForm}
          isSavedReceipt={true}
          receiptId={selectedReceipt.id}
        />
      )}
    </>
  );
};

export default ReceiptsView;