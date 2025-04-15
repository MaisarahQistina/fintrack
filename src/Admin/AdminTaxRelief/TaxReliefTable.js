import React, { useState, useEffect } from "react";
import styles from "./TaxReliefTable.module.css";
import EditReliefForm from "./EditReliefForm";
import { db } from "../../firebase"; // Make sure you have firebase config set up
import { collection, getDocs } from "firebase/firestore";

function TaxReliefTable() {
  const [categoryData, setCategoryData] = useState([]);
  const [systemCategories, setSystemCategories] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  // Fetch the system categories from Firestore
  useEffect(() => {
    const fetchSystemCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "SystemCategory"));
        let categories = {};
        querySnapshot.forEach((doc) => {
          categories[doc.id] = doc.data().categoryName;
        });
        setSystemCategories(categories);
      } catch (error) {
        console.error("Error fetching system categories:", error);
      }
    };

    fetchSystemCategories();
  }, []);

  // Sample data for the table
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "ReliefCategory"));
        let data = [];
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          docData.reliefCatID = doc.id;
          data.push(docData);
        });
  
        // Sort by reliefYear in descending order
        data.sort((a, b) => parseInt(b.reliefYear) - parseInt(a.reliefYear));
  
        setCategoryData(data);
      } catch (error) {
        console.error("Error fetching relief categories:", error);
      }
    };
  
    fetchCategoryData();
  }, []);

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

  // Handle edit button click
  const handleEditClick = (item) => {
    setSelectedCard(item); 
  };

  // Close the edit form
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
          key={item.reliefCatID}
          className={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
          <div className={styles.cell}>{index + 1}</div>
          <div className={styles.cell}>{item.reliefCatID}</div>
          <div className={styles.cell}>{item.reliefCategory}</div>
          <div className={styles.cell}>{item.reliefLimit}</div>
          <div className={styles.cell}>{item.reliefYear}</div>
          <div className={styles.cell}>
            {systemCategories[item.systemCategoryId] || "Unknown"}
          </div>
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
