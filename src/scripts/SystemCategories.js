// src/scripts/addCategories.js
import { setDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const SystemCategories = async () => {
  const categories = [
    { categoryId: "1", categoryName: "Family" },
    { categoryId: "2", categoryName: "Insurance" },
    { categoryId: "3", categoryName: "Food & Drinks" },
    { categoryId: "4", categoryName: "Groceries" },
    { categoryId: "5", categoryName: "Medical Expenses" },
    { categoryId: "6", categoryName: "Rent" },
    { categoryId: "7", categoryName: "Utilities" },
    { categoryId: "8", categoryName: "Education" },
    { categoryId: "9", categoryName: "Books & Magazines" },
    { categoryId: "10", categoryName: "Personal Gadget" },
    { categoryId: "11", categoryName: "Internet Subscription" },
    { categoryId: "12", categoryName: "Contributions" },
    { categoryId: "13", categoryName: "Transportation" },
    { categoryId: "14", categoryName: "Sports" },
  ];

  try {
    for (const category of categories) {
      await setDoc(doc(db, "SystemCategory", category.categoryId), {
        categoryName: category.categoryName,
      });
    }
    console.log("✅ Categories added successfully!");
  } catch (error) {
    console.error("❌ Error adding categories:", error);
  }
};

export default SystemCategories;
