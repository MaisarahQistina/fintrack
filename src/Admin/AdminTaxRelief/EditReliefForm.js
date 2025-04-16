import React, { useState, useEffect } from "react";
import { db } from "../../firebase"; // Import Firestore database
import { doc, updateDoc, getDocs, collection } from "firebase/firestore";
import styles from "./ReliefForm.module.css";

const EditReliefForm = ({ reliefDetails, onClose }) => {
  const [reliefLimit, setReliefLimit] = useState(reliefDetails.reliefLimit);
  const [reliefYear, setReliefYear] = useState(reliefDetails.reliefYear || "");
  const [categoryId, setCategoryId] = useState(""); // will store selected systemCategoryId
  const [categories, setCategories] = useState([]); // list of all categories
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch system categories when component mounts
  useEffect(() => {
    const fetchSystemCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "SystemCategory"));
        const categoryList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCategories(categoryList);
  
        // Set initial selected category
        if (reliefDetails.systemCategoryId) {
          setCategoryId(reliefDetails.systemCategoryId);
        } else if (categoryList.length > 0) {
          setCategoryId(categoryList[0].id);
        }
  
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching system categories:", error);
        setIsLoading(false);
      }
    };
  
    fetchSystemCategories();
  }, [reliefDetails.systemCategoryId]);

  const handleCategoryChange = (e) => {
    setCategoryId(e.target.value);
  };  

  const handleClose = () => {
    if (onClose) onClose();
  };

  const handleSave = async () => {
    try {
      // Prepare the updated data
      const updatedData = {
        reliefLimit,
        reliefYear,
        systemCategoryId: categoryId
      };

      // Get the document reference for the category to update
      const categoryRef = doc(db, "ReliefCategory", reliefDetails.reliefCatID);

      // Update the document in Firestore
      await updateDoc(categoryRef, updatedData);

      // Show success message
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        window.location.reload();
        handleClose(); // Close the form after the update
      }, 2000);
    } catch (error) {
      console.error("Error updating category:", error);
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
              <h1 className={styles.cardTitle}>Edit Tax Relief Category</h1>
              <p>Ensure the relief limit reflects the latest policy changes.</p>
              <span className={styles.closeBtn} onClick={handleClose}>X</span>
            </div>

            <div className={styles.formBody}>
              <div className={styles.infoImage}></div>

              <div className={styles.formFields}>
                <div className={styles.formGroup}>
                  <label htmlFor="id">ID</label>
                  <input
                    type="text"
                    id="id"
                    value={reliefDetails.reliefCatID}
                    className={styles.inputField}
                    readOnly
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="reliefCategory">Relief Category</label>
                  <input
                    type="text"
                    id="reliefCategory"
                    value={reliefDetails.reliefCategory}
                    className={styles.inputField}
                    readOnly
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
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="reliefYear">Relief Year</label>
                  <input
                    type="text"
                    id="reliefYear"
                    value={reliefYear}
                    onChange={(e) => setReliefYear(e.target.value)}
                    className={styles.inputField}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="systemCategory">System Category</label>
                  <select
                    id="systemCategory"
                    value={categoryId}
                    onChange={handleCategoryChange}
                    className={styles.inputField}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.categoryName}
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
            <p>The category is successfully updated.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default EditReliefForm;