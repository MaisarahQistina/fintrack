import React, { useState } from "react";
import InfographicsCard from "./InfographicsCard";
import NewInfographicsForm from "./NewInfographicsForm";
import styles from "./AdminInfographics.module.css";

function AdminInfographics() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileObject, setFileObject] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Store the actual file object for upload to Firebase storage
      setFileObject(file);
      
      // Check if file is an image
      if (!file.type.match('image.*')) {
        alert('Please upload an image file');
        return;
      }
      
      // Create a URL for the image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedFile(e.target.result);
        setShowForm(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setUploadedFile(null);
    setFileObject(null);
  };

  return (
    <>
      <div className={styles.container}>
        <main className={styles.main}>

          <div className={styles.headerWrapper}>
            <h1 className={styles.PageTitle}>Manage Infographics</h1>

            <div className={styles.iconWrapper}>
              <button
                className={styles.uploadButton}
                type="button"
                onClick={() => document.getElementById('fileUpload').click()}
              >
                <img
                  src="/plusIcon.png"
                  className={styles.uploadIcon}
                  alt="Upload icon"
                />
              </button>
            </div>
          </div>

          <form>
            <label htmlFor="fileUpload" className={styles.visuallyHidden}>
              Upload Infographic
            </label>
            <input
              type="file"
              id="fileUpload"
              accept=".jpeg,.jpg,.png,.gif"
              className={styles.visuallyHidden}
              onChange={handleFileChange}
            />
          </form>

          {showForm && (
            <NewInfographicsForm 
              uploadedFile={uploadedFile}
              fileObject={fileObject} 
              onClose={closeForm} 
              isNewInfographic={true}
            />
          )}
          
          {/* Display Infographic cards */}
          <InfographicsCard />
        </main>
      </div>
    </>
  );
}

export default AdminInfographics;