import React, { useState } from "react";
import styles from "./MonthlyExpensesView.module.css";
import ReceiptForm from "../ExpensesUpload/ReceiptForm";

const cards = [
  { img: "/receipt.jpg", categories: ["Medical Treatments", "Vaccinations", "Checkup"] },
  { img: "/receipt2.jpg", categories: ["Office Supplies", "Books"] },
  { img: "/receipt.jpg", categories: ["Groceries", "Dining", "Snacks"] },
  { img: "/receipt2.jpg", categories: ["Transportation", "Fuel"] },
  { img: "/receipt.jpg", categories: ["Medical Treatments", "Vaccinations", "Checkup"] },
  { img: "/receipt2.jpg", categories: ["Office Supplies", "Books"] },
  { img: "/receipt.jpg", categories: ["Groceries", "Dining", "Snacks"] },
  { img: "/receipt2.jpg", categories: ["Transportation", "Fuel"] },
];

const ReceiptsView = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const handleDeleteClick = () => {
    setShowPopup(true);
  };

  const handleConfirmDelete = () => {
    setShowPopup(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000); // Hide success message after 2 seconds
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  // Handle view button click
  const handleViewClick = (card) => {
    setSelectedReceipt(card); // Set selected receipt data
  };

  // Close the receipt form
  const handleCloseForm = () => {
    setSelectedReceipt(null);
  };
  
  return (
    <>
      <div className={styles.receiptsContainer}>
        {cards.map((card, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.imageContainer}>
              <img src={card.img} alt="Receipt" className={styles.image} />
            </div>

            {/* Category Section */}
            <h3 className={styles.title}>Category:</h3>
            <div className={styles.categoryWrapper}>
              <div className={styles.categoryScroll}>
                {card.categories.map((category, i) => (
                  <span key={i} className={styles.categoryLabel}>
                    {category}
                  </span>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className={styles.buttonWrapper}>
            <button className={styles.viewButton} onClick={() => handleViewClick(card)}>
                View
              </button>
              <button className={styles.deleteButton} onClick={handleDeleteClick}>
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

      {/* Show ReceiptForm if a receipt is selected */}
      {selectedReceipt && (
        <ReceiptForm
          uploadedFile={selectedReceipt.img} // Pass the selected image
          onClose={handleCloseForm}         // Handle closing the form
          isSavedReceipt={true}
        />
      )}
    </>
  );
};

export default ReceiptsView;
