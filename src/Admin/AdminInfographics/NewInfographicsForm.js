import React, { useState } from "react";
import styles from "./AdminInfographics.module.css";
import { db, storage } from "../../firebase"; // Make sure this path is correct
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const NewInfographicsForm = ({ uploadedFile, onClose, fileObject }) => {
  const [title, setTitle] = useState("");
  const [resource, setResource] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!uploadedFile) return null; // No file uploaded, don't show the form

  const handleClose = () => {
    if (onClose) onClose();
    window.location.reload();
  };

  const handleSave = async () => {
    // Validation
    if (!title) {
      alert("Please fill out the new infographic title.");
      return;
    }

    if (resource) {
      try {
        new URL(resource); // This will throw if invalid
      } catch (_) {
        alert("Please enter a valid URL.");
        return;
      }
    }
    
    try {
      setIsLoading(true);

      // 1. Upload image to Firebase Storage
      const storageRef = ref(storage, `infographics/${new Date().getTime()}_${fileObject.name}`);
      const uploadResult = await uploadBytes(storageRef, fileObject);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      // 2. Save metadata to Firestore
      const infographicData = {
        title,
        resourceLink: resource || null,
        imageUrl: downloadURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Add document to Firestore (auto-generated ID)
      const docRef = await addDoc(collection(db, "Infographics"), infographicData);
      console.log("Document written with ID: ", docRef.id);

      // Show success message
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        handleClose(); // Close the main form
      }, 2000);
      
    } catch (error) {
      console.error("Error saving infographic:", error);
      alert("Failed to save infographic. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <div className={styles.popupFormOverlay} onClick={handleClose}>
      <div className={styles.popupFormContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.form}>
          <div className={styles.formTitle}>
            <h1 className={styles.cardTitle}>Add a New Infographic</h1>
            <p>Share something new. Add an infographic that users will love and learn from!</p>
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
                    type="url" 
                    id="resourceLink" 
                    placeholder="Add Link"
                    value={resource}
                    onChange={(e) => setResource(e.target.value)}
                    className={styles.inputWithIconField}
                  />
                </div>
              </div>
              
              <button 
                className={styles.saveButton} 
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save"}
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
          <p>The new infographic is successfully saved.</p>
        </div>
      </div>
    )}
    </>
  );
};

export default NewInfographicsForm;