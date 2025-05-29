import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ExpensesUpload.module.css";
import ReceiptForm from "./ReceiptForm";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";

export function ExpensesUpload() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [extractedDate, setExtractedDate] = useState(null);
  const [extractedTotal, setExtractedTotal] = useState(null);
  const [extractedLineItems, setExtractedLineItems] = useState([]);
  const [suggestedCategoryId, setSuggestedCategoryId] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Add state for relief data
  const [reliefData, setReliefData] = useState({
    isReliefEligible: "No",
    reliefCategoryID: "",
    reliefExplanation: "",
    matchingReliefCategory: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchYearsFromFirebase = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        const receiptSnapshot = await getDocs(collection(db, "Receipt"));
        const yearSet = new Set();

        receiptSnapshot.forEach((doc) => {
          const data = doc.data();
          const isUserMatch = data.userID === user.uid;
          const dateStr = data.receiptTransDate || data.transactionDate;
          if (isUserMatch && dateStr) {
            const year = new Date(dateStr).getFullYear();
            yearSet.add(year);
          }
        });

        setAvailableYears([...yearSet].sort((a, b) => b - a));
      } catch (err) {
        console.error("Error fetching years:", err);
      }
    };

    fetchYearsFromFirebase();
  }, []);

  const handleYearChange = (e) => {
    const selectedYear = e.target.value;
    if (selectedYear) {
      navigate(`/yearly-expenses?year=${selectedYear}`);
    }
  };

  const showErrorAndReload = (message) => {
    setErrorMessage(message);
    setShowError(true);

    const timeoutId = setTimeout(() => {
      window.location.reload();
    }, 3000);

    const handleClick = () => {
      clearTimeout(timeoutId);
      window.location.reload();
    };

    document.addEventListener("click", handleClick, { once: true });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validation for file size and type
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      const maxSizeMB = 5;

      if (!allowedTypes.includes(file.type)) {
        showErrorAndReload("Invalid file type. Please upload JPG, PNG, or PDF files only.");
        return;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        showErrorAndReload("File size exceeds 5MB limit. Please upload a smaller file.");
        return;
      }

      try {
        setIsLoading(true); // Start loading

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("http://localhost:5000/process-receipt", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const text = await response.text();
          console.error("Error response:", text);
          alert("Upload failed: " + text);
          return;
        }

        const data = await response.json();
        
        // Debug log to see what data we're getting
        console.log("=== PROCESS RECEIPT RESPONSE ===");
        console.log("Full response:", data);

        if (data.processedImage) {
          const base64Image = `data:image/jpg;base64,${data.processedImage}`;

          setUploadedFile(base64Image);
          setExtractedDate(data.extractedDate);
          setExtractedTotal(data.extractedTotal);
          setExtractedLineItems(data.extractedLineItems || []);
          setSuggestedCategoryId(data.suggestedCategoryId || "19"); // Default to Miscellaneous if not provided
          
          // Set relief data from response
          setReliefData({
            isReliefEligible: data.isReliefEligible || "No",
            reliefCategoryID: data.reliefCategoryID || "",
            reliefExplanation: data.reliefExplanation || "",
            matchingReliefCategory: data.matchingReliefCategory || ""
          });

          console.log("=== EXTRACTED RELIEF DATA ===");
          console.log("isReliefEligible:", data.isReliefEligible);
          console.log("reliefCategoryID:", data.reliefCategoryID);
          console.log("reliefExplanation:", data.reliefExplanation);
          console.log("matchingReliefCategory:", data.matchingReliefCategory);

          setShowForm(true);

          if (data.roboflowResults) {
            console.log("Roboflow Results:", data.roboflowResults);
          }
          
          if (data.extractedText) {
            console.log("Extracted Text:", data.extractedText);
          }
        } else {
          console.error("No processedImage in response");
          alert("Upload failed: No processed image returned");
        }
      } catch (err) {
        console.error("Upload error:", err);
        alert("Error uploading file: " + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setUploadedFile(null);
    // Reset relief data when closing
    setReliefData({
      isReliefEligible: "No",
      reliefCategoryID: "",
      reliefExplanation: "",
      matchingReliefCategory: ""
    });
  };

  return (
    <div className={styles.expensesMainPageView}>
      {isLoading && (
        <div className="loading-container">
          <img alt="loading" src="./loading.svg" className="loading-spinner" />
          <p className="loading-text">Processing receipt...</p>
        </div>
      )}

      <div className={styles.viewBy}>
        View By :
        <select
          name="year"
          id="year"
          className={styles.yearSelect}
          onChange={handleYearChange}
        >
          <option value="">- Select Year -</option>
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.uploadContainer}>
        <div className={styles.iconWrapper}>
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/23619e4ab794bde9d5e6909cc0e42b6e3335cde8fffdeb9d78943204be94ff3c?placeholderIfAbsent=true&apiKey=dc1dfaeed34d4c05a46eb3603635944e"
            className={styles.uploadIcon}
            alt="Upload icon"
          />
        </div>
        <div className={styles.uploadInstructions}>
          <span style={{ fontFamily: "NATS, sans-serif", fontWeight: 400 }}>
            Upload receipts
          </span>
          <span
            style={{
              fontFamily: "NATS, sans-serif",
              fontWeight: 400,
              color: "rgba(0,0,0,1)",
            }}
          >
            {" "}
            to track your expenses.{" "}
          </span>
          <br />
          <span
            style={{
              fontFamily: "NATS, sans-serif",
              fontWeight: 400,
              color: "rgba(0,0,0,1)",
            }}
          >
            Supported formats: JPG, PNG, PDF (&lt;5MB)
          </span>
          <br />
          <span
            style={{
              fontFamily: "NATS, sans-serif",
              fontWeight: 400,
              color: "rgba(0,0,0,1)",
              fontSize: 16,
            }}
          >
            Please upload a clear & full receipt❗
          </span>
        </div>
        <div className={styles.uploadButtonWrapper}>
          <form>
            <label htmlFor="fileUpload" className={styles["visually-hidden"]}>
              Upload Receipt
            </label>
            <input
              type="file"
              id="fileUpload"
              accept=".jpeg,.jpg,.png,.pdf"
              className={styles["visually-hidden"]}
              onChange={handleFileChange}
            />
            <button
              className={styles.uploadButton}
              type="button"
              onClick={() => document.getElementById("fileUpload").click()}
            >
              Upload Receipt
            </button>
          </form>
        </div>
      </div>

      {showForm && (
        <ReceiptForm
          uploadedFile={uploadedFile}
          extractedDate={extractedDate}
          extractedTotal={extractedTotal}
          extractedLineItems={extractedLineItems}
          initialCategoryId={suggestedCategoryId}
          // Pass the relief data as props
          initialIsReliefEligible={reliefData.isReliefEligible}
          initialReliefCategoryID={reliefData.reliefCategoryID}
          initialReliefExplanation={reliefData.reliefExplanation}
          initialMatchingReliefCategory={reliefData.matchingReliefCategory}
          onClose={closeForm}
          isSavedReceipt={false}
          receiptId={null}
        />
      )}

      {showError && (
        <div className={styles.popupOverlay} onClick={() => window.location.reload()}>
          <div className={styles.popupError} onClick={(e) => e.stopPropagation()}>
            <img src="/XMark.png" alt="Error" width="60" height="60" />
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

    </div>
  );
}