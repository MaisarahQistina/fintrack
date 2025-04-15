import React from "react";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const ReliefCategories = async () => {
  const categories = [
    { reliefCatID: "1", reliefCategory: "Individual and dependent relatives", reliefLimit: 9000, reliefYear: 2024, systemCategoryId: "1" },
    { reliefCatID: "2", reliefCategory: "Payment of alimony to former wife", reliefLimit: 4000, reliefYear: 2024, systemCategoryId: "1" },
    { reliefCatID: "3", reliefCategory: "Education Fees", reliefLimit: 7000, reliefYear: 2024,systemCategoryId: "8" },
    { reliefCatID: "4", reliefCategory: "Disabled Individual", reliefLimit: 6000, reliefYear: 2024, systemCategoryId: "1" },
    { reliefCatID: "5", reliefCategory: "Disabled Spouse", reliefLimit: 5000, reliefYear: 2024, systemCategoryId: "1" },
    { reliefCatID: "6", reliefCategory: "EV Charging Facilities", reliefLimit: 2500, reliefYear: 2024, systemCategoryId: "13" },
    { reliefCatID: "7", reliefCategory: "Purchase of breastfeeding equipment", reliefLimit: 1000, reliefYear: 2024, systemCategoryId: "5" },
    { reliefCatID: "8", reliefCategory: "Lifestyle - Books & Magazines", reliefLimit: 2500, reliefYear: 2024, systemCategoryId: "9" },
    { reliefCatID: "9", reliefCategory: "Lifestyle - Personal Gadget", reliefLimit: 2500, reliefYear: 2024, systemCategoryId: "10" },
    { reliefCatID: "10", reliefCategory: "Lifestyle - Internet Subscription", reliefLimit: 2500, reliefYear: 2024, systemCategoryId: "11" },    
    { reliefCatID: "11", reliefCategory: "Sports Equipment & Activities", reliefLimit: 1000, reliefYear: 2024, systemCategoryId: "14" },
    { reliefCatID: "12", reliefCategory: "Purchase of basic supporting equipment", reliefLimit: 6000, reliefYear: 2024, systemCategoryId: "5" },
    { reliefCatID: "13", reliefCategory: "Medical treatment for Parents", reliefLimit: 8000, reliefYear: 2024, systemCategoryId: "5" },
    { reliefCatID: "14", reliefCategory: "Medical Expenses", reliefLimit: 10000, reliefYear: 2024, systemCategoryId: "5" },
    { reliefCatID: "15", reliefCategory: "Child under 18", reliefLimit: 2000, reliefYear: 2024, systemCategoryId: "1" },
    { reliefCatID: "16", reliefCategory: "Child above 18", reliefLimit: 8000, reliefYear: 2024, systemCategoryId: "1" },
    { reliefCatID: "17", reliefCategory: "Registered child care centre fees", reliefLimit: 3000, reliefYear: 2024, systemCategoryId: "1" },
    { reliefCatID: "18", reliefCategory: "Disabled Child", reliefLimit: 6000, reliefYear: 2024, systemCategoryId: "1"},
    { reliefCatID: "19", reliefCategory: "Additional exemption of Disabled Child", reliefLimit: 8000, reliefYear: 2024, systemCategoryId: "1" },
    { reliefCatID: "20", reliefCategory: "PERKESO", reliefLimit: 350, reliefYear: 2024, systemCategoryId: "12" },
    { reliefCatID: "21", reliefCategory: "Life Insurance and EPF", reliefLimit: 7000, reliefYear: 2024, systemCategoryId: "2" },
    { reliefCatID: "22", reliefCategory: "Deferred Annuity and PRS", reliefLimit: 3000, reliefYear: 2024, systemCategoryId: "12" },
    { reliefCatID: "23", reliefCategory: "SSPN", reliefLimit: 8000, reliefYear: 2024, systemCategoryId: "12"  },
    { reliefCatID: "24", reliefCategory: "Education & Medical Insurance", reliefLimit: 3000, reliefYear: 2024, systemCategoryId: "2"  },
  ];

  try {
    for (const category of categories) {
      await setDoc(doc(db, "ReliefCategory", category.reliefCatID), {
        reliefCategory: category.reliefCategory,
        reliefLimit: category.reliefLimit,
        reliefYear: category.reliefYear,
        systemCategoryId: category.systemCategoryId,
      });
    }
    alert("✅ Relief categories added successfully!");
  } catch (error) {
    console.error("❌ Error adding relief categories:", error);
    alert("❌ Failed to add relief categories.");
  }
};

export default ReliefCategories
