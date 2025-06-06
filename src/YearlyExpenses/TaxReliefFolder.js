import React, { useState, useEffect, useCallback} from "react";
import { useSearchParams } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import JSZip from "jszip";
import TaxRelief from "./TaxRelief";
import styles from "./MonthlyExpensesView.module.css";

function TaxReliefFolder() {
    const [searchParams] = useSearchParams();
    const year = searchParams.get("year");

    // State for storing categories
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [totalExpenses, setTotalExpenses] = useState(0);
    // eslint-disable-next-line no-unused-vars
    const [receiptCount, setReceiptCount] = useState(0);

    // Fetch categories from ReliefCategory collection on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoading(true);
            try {
                const categoriesCollection = collection(db, "ReliefCategory");
                const categorySnapshot = await getDocs(categoriesCollection);
                const categoryList = categorySnapshot.docs
                    .map(doc => ({
                        id: doc.id,
                        reliefCatID: doc.id, // Document ID is the reliefCatID
                        ...doc.data()
                    }))
                    .filter(category => category.isActive === true); // Only active categories
                setCategories(categoryList);
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, [year, selectedCategoryId]);

    const handleCategoryChange = (e) => {
        setSelectedCategoryId(e.target.value);
    };

    const fetchTotalExpenses = useCallback(async () => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) {
                console.error("No user is signed in.");
                setTotalExpenses(0);
                setReceiptCount(0);
                return;
            }

            const userID = user.uid;
            const receiptSnapshot = await getDocs(collection(db, "Receipt"));
            let total = 0;
            let count = 0;

            receiptSnapshot.forEach(doc => {
                const receipt = doc.data();
                const receiptDateStr = receipt.receiptTransDate || receipt.transactionDate;
                const isUserMatch = receipt.userID === userID;
                const isTaxRelief = receipt.isRelief === "Yes";
                const matchCategory = !selectedCategoryId || receipt.reliefCategoryID === selectedCategoryId;

                if (receiptDateStr && isUserMatch && isTaxRelief && matchCategory) {
                    const receiptDate = new Date(receiptDateStr);
                    const receiptYear = receiptDate.getFullYear();

                    if (!year || receiptYear === parseInt(year)) {
                        const amount = parseFloat(receipt.totalAmount) || 0;
                        total += amount;
                        count++;
                    }
                }
            });

            setTotalExpenses(total);
            setReceiptCount(count);
        } catch (error) {
            console.error("Error fetching total expenses:", error);
            setTotalExpenses(0);
            setReceiptCount(0);
        }
    }, [year, selectedCategoryId]);

    useEffect(() => {
        fetchTotalExpenses();
    }, [fetchTotalExpenses]);

    // Function to fetch tax relief receipts for download
    const fetchTaxReliefReceipts = async () => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                console.error("No user is signed in.");
                return [];
            }

            const userID = user.uid;

            // Fetch tax relief receipts
            const receiptSnapshot = await getDocs(collection(db, "Receipt"));
            const filteredReceipts = [];

            console.log("Total receipts found:", receiptSnapshot.size);

            receiptSnapshot.forEach(doc => {
                const receipt = doc.data();
                const receiptDateStr = receipt.receiptTransDate || receipt.transactionDate;
                const isUserMatch = receipt.userID === userID;
                
                // Check for tax relief eligibility - match TaxRelief component logic
                const isTaxRelief = receipt.isRelief === "Yes";
                
                // Match by reliefCategoryID (which corresponds to systemCategoryId in ReliefCategory)
                const matchCategory = !selectedCategoryId || receipt.reliefCategoryID === selectedCategoryId;

                console.log("Receipt check:", {
                    id: doc.id,
                    hasDate: !!receiptDateStr,
                    isUserMatch,
                    isTaxRelief,
                    matchCategory,
                    isReliefValue: receipt.isRelief,
                    userID: receipt.userID,
                    currentUserID: userID,
                    reliefCategoryID: receipt.reliefCategoryID
                });

                if (receiptDateStr && isUserMatch && isTaxRelief && matchCategory) {
                    const receiptDate = new Date(receiptDateStr);
                    const receiptYear = receiptDate.getFullYear();

                    if (!year || receiptYear === parseInt(year)) {
                        filteredReceipts.push({
                            id: doc.id,
                            ...receipt
                        });
                    }
                }
            });

            console.log("Filtered receipts found:", filteredReceipts.length);

            return filteredReceipts;
        } catch (error) {
            console.error("Error fetching tax relief receipts:", error);
            return [];
        }
    };

    // Function to download image from URL
    const downloadImage = async (url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.statusText}`);
            }
            return await response.blob();
        } catch (error) {
            console.error("Error downloading image:", error);
            return null;
        }
    };

    // Function to get original filename from URL
    const getOriginalFileName = (url, index) => {
        try {
            // Extract filename from URL (before query parameters)
            const urlParts = url.split('/');
            const fileNameWithParams = urlParts[urlParts.length - 1];
            const fileName = fileNameWithParams.split('?')[0];
            
            // Decode the filename
            const decodedFileName = decodeURIComponent(fileName);
            return decodedFileName || `receipt_${index + 1}.jpg`;
        } catch (error) {
            return `receipt_${index + 1}.jpg`;
        }
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const filteredReceipts = await fetchTaxReliefReceipts();

            if (filteredReceipts.length === 0) {
                alert("No tax relief receipts found for the selected criteria.");
                setIsDownloading(false);
                return;
            }

            const storage = getStorage();
            const zip = new JSZip();

            await Promise.all(filteredReceipts.map(async (receipt, index) => {
                if (!receipt.receiptURL) {
                    console.log(`No receiptURL for receipt ${index + 1}`);
                    return;
                }
                try {
                    const storageRef = ref(storage, receipt.receiptURL);
                    const downloadUrl = await getDownloadURL(storageRef);
                    const imageBlob = await downloadImage(downloadUrl);
                    if (imageBlob) {
                        const fileName = getOriginalFileName(downloadUrl, index);
                        zip.file(fileName, imageBlob);
                    } else {
                        console.log(`Failed to download image blob for receipt ${index + 1}`);
                    }
                } catch (error) {
                    console.error(`Error downloading receipt ${index + 1}:`, error);
                }
            }));

            const zipBlob = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(zipBlob);
            const link = document.createElement("a");
            link.href = url;

            // Use reliefCategory from ReliefCategory for file naming
            const categoryName = selectedCategoryId
                ? categories.find(cat => cat.reliefCatID === selectedCategoryId)?.reliefCategory || "Category"
                : "AllCategories";

            const zipFileName = `TaxRelief_${year || "AllYears"}_${categoryName}.zip`;
            link.download = zipFileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Error creating zip file:", error);
            alert("An error occurred while downloading the receipts. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <main className={styles.monthlyExpensesView}>
            {/* View By Section */}
            {year && (
                <div className={styles.viewBy}>
                    <img src="/Calendar.png" alt="Calendar" width="40" height="40" />
                    <span>{`${year} > Tax Relief`}</span>
                </div>
            )}

            {/* Dropdown Selection for Categories */}
            <div className={styles.viewDropdown}>
                <select 
                    name="category" 
                    id="category" 
                    className={styles.monthSelect} 
                    value={selectedCategoryId} 
                    onChange={handleCategoryChange}
                    disabled={isLoading || isDownloading}
                >
                    <option value="">- Select Relief Category -</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.reliefCatID}>
                            {category.reliefCategory}
                        </option>
                    ))}
                </select>
                {isLoading && <span className={styles.loadingIndicator}></span>}

                <button 
                    className={styles.reliefDownload}
                    onClick={handleDownload}
                    disabled={isDownloading}
                >
                    <img 
                        src="/download.png" 
                        alt="Download" 
                        style={{ width: "16px", height: "16px" }} 
                    />
                    {isDownloading ? "Downloading..." : "Download"}
                </button>
            </div>

            {/* Receipts Grid */}
            <TaxRelief year={year} categoryId={selectedCategoryId} />

            <div className={styles.monthlyTotal}>
            <h2>Total Relief - Eligible Expenses: RM {totalExpenses}</h2>
            </div>
        </main>
    );
}

export default TaxReliefFolder;