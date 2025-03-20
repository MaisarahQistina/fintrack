import React, { useState } from "react";
import styles from "./AdminInfographics.module.css";
import EditInfographicsForm from "./EditInfographicsForm";

const cards = [
  { img: "/info.png" },
  { img: "/cost.png" },
  { img: "/info.png" },
  { img: "/cost.png" },
  { img: "/info.png" },
  { img: "/cost.png" },
  { img: "/info.png" },
  { img: "/cost.png" },
  { img: "/info.png" },
  { img: "/cost.png" },
];

const InfographicsCard = () => {
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
  const handleViewClick = (card) => {
    setSelectedCard(card); // Set selected receipt data
  };

  // Close the receipt form
  const handleCloseForm = () => {
    setSelectedCard(null);
  };
  
  return (
    <>
      <div className={styles.cardsContainer}>
        {cards.map((card, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.imageCardContainer}>
              <img src={card.img} alt="Infographic" className={styles.image} />
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
            <p>Are you sure you want to delete this infographic?</p>
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
            <p>The infographic is successfully deleted.</p>
          </div>
        </div>
      )}

      {/* Show Infographic Form if a receipt is selected */}
      {selectedCard && (
        <EditInfographicsForm
          uploadedFile={selectedCard.img} // Pass the selected image
          onClose={handleCloseForm}         // Handle closing the form
          isSavedInfo={true}
        />
      )}
    </>
  );
};

export default InfographicsCard;
