import { useState } from "react";
import { getDoc, setDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const SystemCategories = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const syncCategories = async () => {
    const categories = [
      { categoryId: "0", categoryName: "Family" },
      { categoryId: "1", categoryName: "Insurance" },
      { categoryId: "2", categoryName: "Food & Drinks" },
      { categoryId: "3", categoryName: "Groceries" },
      { categoryId: "4", categoryName: "Medical Expenses" },
      { categoryId: "5", categoryName: "Rent" },
      { categoryId: "6", categoryName: "Utilities" },
      { categoryId: "7", categoryName: "Education" },
      { categoryId: "8", categoryName: "Books & Magazines" },
      { categoryId: "9", categoryName: "Gadget & Electronics" },
      { categoryId: "10", categoryName: "Subscription" },
      { categoryId: "11", categoryName: "Contributions" },
      { categoryId: "12", categoryName: "Transportation" },
      { categoryId: "13", categoryName: "Sports" },
      { categoryId: "14", categoryName: "Apparel" },
      { categoryId: "15", categoryName: "Entertainment" },
      { categoryId: "16", categoryName: "Personal Care & Beauty" },
      { categoryId: "17", categoryName: "Travel" },
      { categoryId: "18", categoryName: "Accessories" },
      { categoryId: "19", categoryName: "Miscellaneous Items" },
    ];

    setLoading(true);
    setStatus("");

    try {
      for (const category of categories) {
        const docRef = doc(db, "SystemCategory", category.categoryId);
        const docSnapshot = await getDoc(docRef);
        if (!docSnapshot.exists()) {
          await setDoc(docRef, {
            categoryName: category.categoryName,
          });
        }
      }
      setStatus("✅ Categories synced successfully.");
    } catch (error) {
      console.error("❌ Error syncing categories:", error);
      setStatus("❌ Error syncing categories. Check console.");
    } finally {
      setLoading(false);
    }
  };
};

export default SystemCategories;
