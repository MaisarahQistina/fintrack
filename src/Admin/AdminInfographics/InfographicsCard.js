import React, { useState, useEffect } from "react";
import styles from "./AdminInfographics.module.css";
import EditInfographicsForm from "./EditInfographicsForm";
import { db, storage } from "../../firebase"; // Update this path
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";

const InfographicsCard = () => {
  const [infographics, setInfographics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [infographicToDelete, setInfographicToDelete] = useState(null);

  // Fetch infographics from Firestore
  useEffect(() => {
    const fetchInfographics = async () => {
      try {
        const infographicsCollection = collection(db, "Infographics");
        const infographicsSnapshot = await getDocs(infographicsCollection);
        const infographicsList = infographicsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setInfographics(infographicsList);
      } catch (error) {
        console.error("Error fetching infographics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInfographics();
  }, []);

  const handleDeleteClick = (infographic) => {
    setInfographicToDelete(infographic);
    setShowPopup(true);
  };

  const handleConfirmDelete = async () => {
    if (!infographicToDelete) return;
    
    try {
      // 1. Delete the image from Firebase Storage
      if (infographicToDelete.imageUrl) {
        // Extract the file path from the URL
        // The format of Firebase Storage URLs is usually like:
        // https://firebasestorage.googleapis.com/v0/b/[bucket]/o/[encoded-path]?token...
        // We need to extract the [encoded-path] part
        const imageUrl = infographicToDelete.imageUrl;
        const imagePath = decodeURIComponent(imageUrl.split('/o/')[1].split('?')[0]);
        const storageRef = ref(storage, imagePath);
        await deleteObject(storageRef);
      }
      
      // 2. Delete the document from Firestore
      await deleteDoc(doc(db, "Infographics", infographicToDelete.id));
      
      // 3. Update the UI - remove the deleted infographic from the state
      setInfographics(infographics.filter(item => item.id !== infographicToDelete.id));
      
      // 4. Show success message
      setShowPopup(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000); // Hide success message after 2 seconds
      
    } catch (error) {
      console.error("Error deleting infographic:", error);
      alert("Failed to delete infographic. Please try again.");
      setShowPopup(false);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setInfographicToDelete(null);
  };

  // Handle view button click
  const handleViewClick = (infographic) => {
    setSelectedCard(infographic); // Set selected infographic data
  };

  // Close the form
  const handleCloseForm = () => {
    setSelectedCard(null);
  };
  
  if (loading) {
    return <div className={styles.loading}>Loading infographics...</div>;
  }
  
  return (
    <>
      <div className={styles.cardsContainer}>
        {infographics.length > 0 ? (
          infographics.map((infographic) => (
            <div key={infographic.id} className={styles.card}>
              <div className={styles.imageCardContainer}>
                <img 
                  src={infographic.imageUrl} 
                  alt={infographic.title || "Infographic"} 
                  className={styles.image} 
                />
              </div>

              {/* Buttons */}
              <div className={styles.buttonWrapper}>
                <button 
                  className={styles.viewButton} 
                  onClick={() => handleViewClick(infographic)}
                >
                  View
                </button>
                <button 
                  className={styles.deleteButton} 
                  onClick={() => handleDeleteClick(infographic)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noInfographics}>No infographics found. Upload one to get started!</div>
        )}
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

      {/* Show Infographic Form if an infographic is selected */}
      {selectedCard && (
        <EditInfographicsForm
          infographicData={selectedCard} // Pass the complete infographic data
          uploadedFile={selectedCard.imageUrl} // Pass the image URL
          onClose={handleCloseForm}
          isSavedInfo={true}
        />
      )}
    </>
  );
};

export default InfographicsCard;