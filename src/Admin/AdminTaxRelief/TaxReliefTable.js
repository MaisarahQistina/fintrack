import React, { useState } from "react";
import styles from "./TaxReliefTable.module.css";
import EditReliefForm from "./EditReliefForm";

function TaxReliefTable() {
  // Sample data for the table
  const categoryData = [
    {
      id: 1,
      reliefCategory: "Medical Expenses",
      reliefLimit: "RM 10000",
      applicableYear: 2025,
      systemCategory: "Medical Expenses",
    },
    {
      id: 2,
      reliefCategory: "PERKESO",
      reliefLimit: "RM 350",
      applicableYear: 2025,
      systemCategory: "Contributions",
    },
    {
      id: 3,
      reliefCategory: "Disabled Child",
      reliefLimit: "RM 6000",
      applicableYear: 2025,
      systemCategory: "Family",
    },
    {
      id: 4,
      reliefCategory: "Sports Equipment & Activities",
      reliefLimit: "RM 1000",
      applicableYear: 2025,
      systemCategory: "Sports",
    },
    {
      id: 5,
      reliefCategory: "Education & Medical Insurance",
      reliefLimit: "RM 3000",
      applicableYear: 2025,
      systemCategory: "Insurance",
    },
    {
      id: 6,
      reliefCategory: "Child under 18",
      reliefLimit: "RM 2000",
      applicableYear: 2025,
      systemCategory: "Family",
    },
    {
      id: 7,
      reliefCategory: "Individual Education Fees",
      reliefLimit: "RM 7000",
      applicableYear: 2025,
      systemCategory: "Education",
    },
  ];

  const [showPopup, setShowPopup] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

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
  const handleEditClick = (item) => {
    setSelectedCard(item); 
  };

  // Close the receipt form
  const handleCloseForm = () => {
    setSelectedCard(null);
  };

  return (
    <div className={styles.table}>
      <div className={styles.tableHeader}>
        <div className={styles.headerCell}>No.</div>
        <div className={styles.headerCell}>ID</div>
        <div className={styles.headerCell}>Relief Category</div>
        <div className={styles.headerCell}>Relief Limit</div>
        <div className={styles.headerCell}>Applicable Year</div>
        <div className={styles.headerCell}>System Category</div>
        <div className={styles.headerCell}></div>
        <div className={styles.headerCell}></div>
      </div>
      {categoryData.map((item, index) => (
        <div
          key={item.id}
          className={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
          <div className={styles.cell}>{index + 1}</div>
          <div className={styles.cell}>{item.id}</div>
          <div className={styles.cell}>{item.reliefCategory}</div>
          <div className={styles.cell}>{item.reliefLimit}</div>
          <div className={styles.cell}>{item.applicableYear}</div>
          <div className={styles.cell}>{item.systemCategory}</div>
          <div className={styles.cell}>
            <button className={styles.editButton} onClick={() => handleEditClick(item)}>Edit</button>
          </div>
          <div className={styles.cell}>
            <button className={styles.deleteButton} onClick={handleDeleteClick}>Delete</button>
          </div>
        </div>
      ))}

      {showPopup && (
        <div className={styles.popupOverlay} onClick={closePopup}>
          <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
            <p>Are you sure you want to delete this Relief Category?</p>
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
            <p>The Relief Category is successfully deleted.</p>
          </div>
        </div>
      )}

      {/* Show Infographic Form if a receipt is selected */}
      {selectedCard && (
        <EditReliefForm
          reliefDetails={selectedCard} // Pass the full selectedCard object
          onClose={handleCloseForm}
          isSavedInfo={true}
        />
      )}
    </div>
  );
}

export default TaxReliefTable;
