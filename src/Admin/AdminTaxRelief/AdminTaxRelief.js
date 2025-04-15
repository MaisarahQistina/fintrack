import React, { useState } from "react";
import ReliefTable from "./TaxReliefTable";
import NewReliefForm from "./NewReliefForm";
import styles from "./AdminTaxRelief.module.css";

const AdminTaxRelief = () => {
  const [showNewReliefForm, setShowNewReliefForm] = useState(false); // Control visibility of form

  const handleOpenNewForm = () => {
    setShowNewReliefForm(true); // Open the form when Plus icon is clicked
  };

  const handleCloseNewForm = () => {
    setShowNewReliefForm(false); // Close the form when it's canceled or saved
  };

  return (
    <>
      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.headerWrapper}>
            <h1 className={styles.PageTitle}>Manage Tax Relief Category</h1>

            <div className={styles.iconWrapper}>
              <button
                className={styles.uploadButton}
                type="button"
                onClick={handleOpenNewForm} // Call the function to open the form
              >
                <img
                  src="/plusIcon.png"
                  className={styles.uploadIcon}
                  alt="Upload icon"
                />
              </button>
            </div>
          </div>

          <ReliefTable />

          {/* Render the NewReliefForm if showNewReliefForm is true */}
          {showNewReliefForm && (
            <NewReliefForm onClose={handleCloseNewForm} />
          )}
        </main>
      </div>
    </>
  );
};

export default AdminTaxRelief;
