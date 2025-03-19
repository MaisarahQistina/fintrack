import React, { useState } from "react";
import styles from "./AdminInfographics.module.css";

const EditInfographicsForm = ({ uploadedFile, onClose }) => {
  const [title, setTitle] = useState("Financial Planning Guide");
  const [resource, setResource] = useState("https://example.com/finance-guide");
  const [showSuccess, setShowSuccess] = useState(false);

  if (!uploadedFile) return null; // No file uploaded, don't show the form

  const handleClose = () => {
    if (onClose) onClose();
  };

  const handleSave = () => {
    // Save logic here
    console.log("Saving infographic data:", {
      title,
      resource
    });
    
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      handleClose(); // Close the main form
    }, 2000);
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
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={styles.inputWithIconField}
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
              <label htmlFor="totalAmount">Resource Link</label>
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
          <p>The infographic is successfully saved.</p>
        </div>
      </div>
    )}
    </>
  );
};

export default EditInfographicsForm;