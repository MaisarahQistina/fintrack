import React, { useState, useEffect } from "react";
import styles from "./ReliefForm.module.css";
import { db } from "../../firebase"; // Import Firestore database
import { collection, getDocs, doc, setDoc } from "firebase/firestore";

const NewReliefForm = ({ onClose }) => {
  const [reliefCategory, setReliefCategory] = useState(""); 
  const [reliefLimit, setReliefLimit] = useState(""); 
  const [applicableYear, setApplicableYear] = useState(""); 
  const [systemCategoryId, setSystemCategoryId] = useState(""); 
  const [systemCategories, setSystemCategories] = useState({});
  const [nextReliefCatID, setNextReliefCatID] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch system categories
        const querySnapshot = await getDocs(collection(db, "SystemCategory"));
        let categories = {};
        querySnapshot.forEach((doc) => {
          categories[doc.id] = doc.data().categoryName;
        });
        setSystemCategories(categories);
  
        // Fetch ReliefCategory docs to find highest doc ID
        const reliefSnapshot = await getDocs(collection(db, "ReliefCategory"));
        let maxID = 0;
        reliefSnapshot.forEach((doc) => {
          const docID = parseInt(doc.id);
          if (!isNaN(docID) && docID > maxID) {
            maxID = docID;
          }
        });
  
        // Set next ID
        setNextReliefCatID((maxID + 1).toString());
  
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, []);  

  const handleClose = () => {
    if (onClose) onClose();
  };

  const handleSave = async () => {
    if (!reliefCategory || !reliefLimit || !applicableYear || !systemCategoryId) {
      alert("All fields are required. Please fill in all fields.");
      return;
    }

    try {
      // Create new relief category document
      const newReliefData = {
        reliefCatID: nextReliefCatID,
        reliefCategory: reliefCategory,
        reliefLimit: reliefLimit,
        reliefYear: applicableYear,
        systemCategoryId: systemCategoryId
      };

      // Add document to Firestore
      await setDoc(doc(db, "ReliefCategory", nextReliefCatID), newReliefData);
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        handleClose(); // Close the form after saving
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error adding new relief category:", error);
      alert("Failed to save the new category. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className={styles.popupFormOverlay}>
        <div className={styles.popupFormContent}>
          <div className={styles.loading}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.popupFormOverlay} onClick={handleClose}>
        <div className={styles.popupFormContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.form}>
            <div className={styles.formTitle}>
              <h1 className={styles.cardTitle}>Add New Tax Relief Category</h1>
              <p>Fill in the details for the new category.</p>
              <span className={styles.closeBtn} onClick={handleClose}>X</span>
            </div>
            
            <div className={styles.formBody}>
              <div className={styles.formFields}>
                <div className={styles.formGroup}>
                  <label htmlFor="reliefCatID">Relief Category ID</label>
                  <input
                    type="text"
                    id="reliefCatID"
                    value={nextReliefCatID}
                    className={styles.inputField}
                    readOnly
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="reliefCategory">Relief Category</label>
                  <input
                    type="text"
                    id="reliefCategory"
                    value={reliefCategory}
                    onChange={(e) => setReliefCategory(e.target.value)}
                    className={styles.inputField}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="reliefLimit">Relief Limit</label>
                  <input
                    type="text"
                    id="reliefLimit"
                    value={reliefLimit}
                    onChange={(e) => setReliefLimit(e.target.value)}
                    className={styles.inputField}
                    placeholder="e.g. 3000"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="applicableYear">Applicable Year</label>
                  <input
                    type="number"
                    id="applicableYear"
                    value={applicableYear}
                    onChange={(e) => setApplicableYear(e.target.value)}
                    className={styles.inputField}
                    placeholder="e.g. 2025"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="systemCategory">System Category</label>
                  <select
                    id="systemCategory"
                    value={systemCategoryId}
                    onChange={(e) => setSystemCategoryId(e.target.value)}
                    className={styles.inputField}
                  >
                    <option value="">- Select -</option>
                    {Object.entries(systemCategories).map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
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
            <p>The new category has been successfully added.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default NewReliefForm;