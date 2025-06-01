import React, { useState, useEffect } from "react";
import styles from "./MonthlyExpensesView.module.css";
import ReceiptForm from "../ExpensesUpload/ReceiptForm";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";

const TaxRelief = ({ year, categoryId }) => {
  const [receipts, setReceipts] = useState([]);
  const [categoriesMap, setCategoriesMap] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptToDelete, setReceiptToDelete] = useState(null);

  // Fetch categories and tax relief receipts based on year and categoryId
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
  
        // Fetch categories from ReliefCategory instead of SystemCategory
        const categorySnapshot = await getDocs(collection(db, "ReliefCategory"));
        const categoryData = {};
        categorySnapshot.forEach(doc => {
          const data = doc.data();
          // Map document ID (which is the reliefCatID) to reliefCategory name
          if (data.reliefCategory) {
            categoryData[doc.id] = data.reliefCategory;
          }
        });
        setCategoriesMap(categoryData);
  
        // Fetch tax relief receipts
        const receiptSnapshot = await getDocs(collection(db, "Receipt"));
        const filteredReceipts = [];
  
        receiptSnapshot.forEach(doc => {
          const receipt = doc.data();
          const receiptDateStr = receipt.receiptTransDate || receipt.transactionDate;
          const isUserMatch = receipt.userID === userID;
          const isTaxRelief = receipt.isRelief === "Yes";
          // Match using reliefCategoryID instead of systemCategoryID
          const matchCategory = !categoryId || receipt.reliefCategoryID === categoryId;
  
          if (receiptDateStr && isUserMatch && isTaxRelief && matchCategory) {
            const receiptDate = new Date(receiptDateStr);
            const receiptYear = receiptDate.getFullYear();
  
            if (!year || receiptYear === parseInt(year)) {
              filteredReceipts.push({
                id: doc.id,
                ...receipt
              });
            }
          }
        });
  
        setReceipts(filteredReceipts);
      } catch (error) {
        console.error("Error fetching tax relief receipts:", error);
      }
    };
  
    fetchData();
  }, [year, categoryId]);  

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
            No tax relief receipts found{year ? ` for ${year}` : ''}{categoryId ? ' in the selected category' : ''}.
          </p>       
        )}
        {receipts.map((receipt) => (
          <div key={receipt.id} className={styles.card}>
            <div className={styles.imageContainer}>
              <img 
                src={receipt.receiptURL} 
                alt="Receipt" 
                className={styles.image} 
              />
            </div>

            {/* Category Section */}
            <h3 className={styles.title}>Category:</h3>
            <div className={styles.categoryWrapper}>
              <div className={styles.categoryScroll}>
                <span className={styles.categoryLabel}>
                  {categoriesMap[receipt.reliefCategoryID] || "Unknown"}
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
          uploadedFile={selectedReceipt.receiptURL}
          extractedDate={selectedReceipt.receiptTransDate || selectedReceipt.transactionDate}
          extractedTotal={selectedReceipt.totalAmount ? selectedReceipt.totalAmount.toString() : ""}
          initialCategoryId={selectedReceipt.reliefCategoryID}
          onClose={handleCloseForm}
          isSavedReceipt={true}
          receiptId={selectedReceipt.id}
        />
      )}
    </>
  );
};

export default TaxRelief;