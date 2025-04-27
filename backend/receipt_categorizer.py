from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import numpy as np
from PIL import Image
import pytesseract
import base64
import io
import re

# Load the pre-trained model and tokenizer
model_name = "maiqos/bert-receipt-categorization"
tokenizer = None
model = None

# Define category mapping based on SystemCategory
CATEGORY_MAPPING = {
    0: "0",  # Family
    1: "1",  # Insurance
    2: "2",  # Food & Drinks
    3: "3",  # Groceries
    4: "4",  # Medical Expenses
    5: "5",  # Rent
    6: "6",  # Utilities
    7: "7",  # Education
    8: "8",  # Books & Magazines
    9: "9",  # Gadget & Electronics
    10: "10",  # Subscription
    11: "11",  # Contributions
    12: "12",  # Transportation
    13: "13",  # Sports
    14: "14",  # Apparel
    15: "15",  # Entertainment
    16: "16",  # Personal Care & Beauty
    17: "17",  # Travel
    18: "18",  # Accessories
    19: "19",  # Miscellaneous Items
}

# Load the pre-trained model 
def load_model():
    """Load the model and tokenizer if not already loaded"""
    global tokenizer, model
    
    if tokenizer is None or model is None:
        try:
            print("Attempting to load model from:", model_name)
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            model = AutoModelForSequenceClassification.from_pretrained(model_name)
            print("Model and tokenizer loaded successfully")
            print(f"Model has {model.config.num_labels} output classes")
            return True
        except Exception as e:
            print(f"Error loading model: {e}")
            return False
    
    return True

# Improve the line items text
def clean_line_item_text(line_items):
    line_items = re.sub(r'[^a-zA-Z0-9\s.,;()@-]', '', line_items)  
    line_items = re.sub(r'\s+', ' ', line_items)
    line_items = re.sub(r'\[.*?\]', '', line_items) 
    line_items = re.sub(r'(\d)\s+', r'\1 ', line_items)
    line_items = re.sub(r'(\d)(?=\.\d{2})', r'\1 ', line_items)  
    line_items = line_items.strip()

    return line_items

# Categorize receipt based on line items
def categorize_receipt(line_items):
    """Categorize receipt based on full line items text"""
    print("==== TEXT FED TO MODEL ====")
    print(line_items)  
    print("==========================")
    
    if not load_model():
        print("Failed to load model, defaulting to Miscellaneous")
        return "19"  # Default to Miscellaneous 
    
    try:
        line_items = line_items.lower().strip()
        
        if len(line_items) < 5:
            print("Text too short, defaulting to Miscellaneous")
            return "19"  # Default to Miscellaneous
            
        inputs = tokenizer(line_items, padding=True, truncation=True, return_tensors="pt", max_length=512)
        
        # Get model predictions
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
        
        # Map to category ID
        category_id = CATEGORY_MAPPING.get(predicted_class, "19")  # Default to Miscellaneous
        print(f"Selected category: {category_id} (class {predicted_class})")
        return category_id
        
    except Exception as e:
        print(f"Error categorizing receipt: {e}")
        return "19"  # Default to Miscellaneous
