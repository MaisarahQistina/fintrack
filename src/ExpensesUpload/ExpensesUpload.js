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
  const [suggestedCategoryId, setSuggestedCategoryId] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);

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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
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

        if (data.processedImage) {
          const base64Image = `data:image/jpg;base64,${data.processedImage}`;

          setUploadedFile(base64Image);
          setExtractedDate(data.extractedDate);
          setExtractedTotal(data.extractedTotal);
          setSuggestedCategoryId(data.suggestedCategoryId || "19"); // Default to Miscellaneous if not provided
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
            Supported formats: JPG, PNG (&lt;5MB)
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
          initialCategoryId={suggestedCategoryId}
          onClose={closeForm}
        />
      )}
    </div>
  );
}