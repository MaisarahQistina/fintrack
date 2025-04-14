import React, { useState } from "react";
import styles from "./AdminInfographics.module.css";
import { db } from "../../firebase"; // Update this path
import { doc, updateDoc } from "firebase/firestore";

const EditInfographicsForm = ({ infographicData, uploadedFile, onClose, isSavedInfo }) => {
  const [title, setTitle] = useState(infographicData?.title || "");
  const [resource, setResource] = useState(infographicData?.resourceLink || "");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClose = () => {
    if (onClose) onClose();
  };

  const handleSave = async () => {
    // Validation
    if (!title) {
      alert("Please fill out the infographic title.");
      return;
    }

    try {
      // Update the document in Firestore
      const infographicRef = doc(db, "Infographics", infographicData.id);
      await updateDoc(infographicRef, {
        title: title,
        resourceLink: resource || null,
        updatedAt: new Date()
      });
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        handleClose(); // Close the form
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error("Error updating infographic:", error);
      alert("Failed to update infographic. Please try again.");
    }
  };

  return (
    <>
    <div className={styles.popupFormOverlay} onClick={handleClose}>
      <div className={styles.popupFormContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.form}>
          <div className={styles.formTitle}>
            <h1 className={styles.cardTitle}>Edit Infographic</h1>
            <p>Only the title and resources link can be updated. For changes to the image, add a new infographic to ensure clarity for users.</p>
            <span className={styles.closeBtn} onClick={handleClose}>X</span>
          </div>
          
          <div className={styles.formBody}>
            <div className={styles.infoImage}>
              <div className={styles.imageContainer}>
                {uploadedFile && (
                  <img
                    src={uploadedFile} 
                    alt="Infographic"
                    className={styles.uploadedImage}
                  />
                )}
              </div>
            </div>
            
            <div className={styles.formFields}>
              <div className={styles.formGroup}>
                <label htmlFor="title">Title</label>
                <div className={styles.inputWithIcon}>
                  <div className={styles.iconContainer}>
                    <img 
                      src="/penIcon.png" 
                      alt="Edit" 
                      className={styles.inputIcon} 
                    />
                  </div>
                  <input 
                    type="text" 
                    id="title" 
                    placeholder="Add Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={styles.inputWithIconField}
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
              <label htmlFor="resourceLink">Resource Link</label>
                <div className={styles.inputWithIcon}>
                  <div className={styles.iconContainer}>
                    <img 
                      src="/linkIcon.png" 
                      alt="Link" 
                      className={styles.inputIcon} 
                    />
                  </div>                
                  <input 
                    type="text" 
                    id="resourceLink" 
                    placeholder="Add Link"
                    value={resource}
                    onChange={(e) => setResource(e.target.value)}
                    className={styles.inputField}
                  />
                </div>
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
          <p>The infographic is successfully updated.</p>
        </div>
      </div>
    )}
    </>
  );
};

export default EditInfographicsForm;