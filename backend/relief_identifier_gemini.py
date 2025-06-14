import google.generativeai as genai
import os
from dotenv import load_dotenv
import logging
import json
from firebase_admin import firestore

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('models/gemini-2.0-flash')

def get_relief_categories():    
    try:
        db = firestore.client()
        relief_categories = []
        
        # Query all active relief categories
        query = db.collection('ReliefCategory').where('isActive', '==', True)
        docs = query.stream()
        
        for doc in docs:
            category_data = doc.to_dict()
            category_data['id'] = doc.id  # Add document ID
            relief_categories.append(category_data)
            
        logger.debug(f"Retrieved {len(relief_categories)} relief categories")
        return relief_categories
    except Exception as e:
        logger.error(f"Error fetching relief categories: {e}")
        return []

def check_relief_eligibility(line_items, relief_description=None):
    try:
        # Get all relief categories from database if no specific one provided
        if not relief_description:
            relief_categories = get_relief_categories()
            if not relief_categories:
                return {
                    "eligible": False,
                    "reliefCategoryID": "",
                    "explanation": "Could not retrieve relief categories from database"
                }
            
            # Build a comprehensive relief description from all categories
            relief_descriptions = []
            for category in relief_categories:
                relief_descriptions.append(f"{category['reliefCategory']}: {category['description']}")
            
            relief_description = "\n".join(relief_descriptions)
        
        # Ensure line_items is a list
        if isinstance(line_items, str):
            line_items = [line_items]
            
        # Format line items for prompt
        items_text = ", ".join(line_items) if line_items else "No items found"
        
        # Create prompt for Gemini
        prompt = f"""
        You are a Malaysian tax relief identifier for LHDN (Lembaga Hasil Dalam Negeri).
        Analyze the following receipt line items and determine if they qualify for any Malaysian tax relief categories.
        
        Receipt line items:
        {items_text}
        
        Available relief categories and descriptions:
        {relief_description}

        STRICT MATCHING RULES:
        1. Items must LITERALLY match the category description
        2. NO creative interpretations or extensions
        3. NO stretching definitions to make items fit
        4. When unsure, choose NOT eligible
        
        Respond in JSON format with the following structure:
        {{
            "eligible": true/false,
            "matchingCategory": "name of matching relief category if eligible, otherwise empty string",
            "explanation": "Brief explanation of your decision"
        }}
        
        Only return the JSON - no other text.
        """
        
        # Call Gemini API
        logger.debug("Sending request to Gemini API")
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Extract JSON from response
        # Sometimes Gemini includes code blocks or extra text
        if "```json" in response_text:
            json_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            json_text = response_text.split("```")[1].strip()
        else:
            json_text = response_text
            
        # Parse response
        result = json.loads(json_text)
        
        # Look up the category ID if eligible
        relief_category_id = ""
        if result.get("eligible", False) and result.get("matchingCategory"):
            # Find matching category ID
            relief_categories = get_relief_categories()
            for category in relief_categories:
                if category['reliefCategory'].lower() == result["matchingCategory"].lower():
                    relief_category_id = category['id']
                    break
                    
        return {
            "eligible": result.get("eligible", False),
            "reliefCategoryID": relief_category_id,
            "explanation": result.get("explanation", "No explanation provided"),
            "matchingCategory": result.get("matchingCategory", "")
        }
        
    except Exception as e:
        logger.error(f"Error checking relief eligibility: {e}", exc_info=True)
        return {
            "eligible": False,
            "reliefCategoryID": "",
            "explanation": f"Error processing: {str(e)}"
        }