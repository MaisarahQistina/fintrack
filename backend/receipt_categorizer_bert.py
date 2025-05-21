from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import numpy as np
import re

# Load the pre-trained model and tokenizer
model_name = "maiqos/bert-receipt-categorization-v2"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

# Define category mapping
CATEGORY_MAPPING = {
    0: "0", 1: "1", 2: "2", 3: "3", 4: "4",
    5: "5", 6: "6", 7: "7", 8: "8", 9: "9",
    10: "10", 11: "11", 12: "12", 13: "13", 14: "14",
    15: "15", 16: "16", 17: "17", 18: "18", 19: "19"
}

def clean_line_item_text(line_items):
    line_items = re.sub(r'[^a-zA-Z0-9\s.,;()@-]', '', line_items)  
    line_items = re.sub(r'\s+', ' ', line_items)
    line_items = re.sub(r'\[.*?\]', '', line_items) 
    line_items = re.sub(r'(\d)\s+', r'\1 ', line_items)
    line_items = re.sub(r'(\d)(?=\.\d{2})', r'\1 ', line_items)  
    return line_items.strip()

def extract_items_only(text):
    """Extract likely item lines with text and prices"""
    lines = text.splitlines()
    item_lines = []
    for line in lines:
        if re.search(r'\d+\.\d{2}', line) and any(char.isalpha() for char in line):
            item_lines.append(line)
    return " ".join(item_lines)

def categorize_receipt(ocr_text, merchant_name=""):
    print("==== TEXT FED TO MODEL ====")
    print(ocr_text)
    print("==========================")

    try:
        raw_items = extract_items_only(ocr_text)
        cleaned_items = clean_line_item_text(raw_items)
        combined_input = f"{merchant_name}: {cleaned_items}".lower().strip()

        if len(combined_input) < 5:
            print("Text too short, defaulting to Miscellaneous")
            return "19"

        inputs = tokenizer(combined_input, padding=True, truncation=True, return_tensors="pt", max_length=512)

        with torch.no_grad():
            outputs = model(**inputs)
            predictions = outputs.logits
            probabilities = torch.nn.functional.softmax(predictions, dim=1)
            predicted_class = torch.argmax(probabilities, dim=1).item()

            top_categories = sorted([(i, prob.item()) for i, prob in enumerate(probabilities[0])], 
                                    key=lambda x: x[1], reverse=True)[:3]
            print("Top 3 category predictions:")
            for class_idx, prob in top_categories:
                print(f"Category {class_idx} ({CATEGORY_MAPPING.get(class_idx)}): {prob:.4f}")

        # Optional override rule based on common food words
        food_keywords = ['salad', 'shrimp', 'combo', 'chicken', 'steak', 'curry', 'caesar', 'rib', 'cocktail', 'spaghetti','reserve', 'restaurant', 'dine', 'grill', 'food', 'drink', 'dinner', 'beverage']
        if predicted_class != 2 and any(word in cleaned_items.lower() for word in food_keywords):
            print("Overriding prediction to Category 2 (Food & Drinks) based on keyword presence.")
            predicted_class = 2

        category_id = CATEGORY_MAPPING.get(predicted_class, "19")
        print(f"Selected category: {category_id} (class {predicted_class})")
        return category_id

    except Exception as e:
        print(f"Error during categorization: {e}")
        return "19"
