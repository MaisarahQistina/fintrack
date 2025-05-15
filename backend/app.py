# app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

from budget_predictor import aggregate_and_predict
from receipt_processor import process_receipt_image
from receipt_reader import extract_total, extract_date, format_date, extract_line_items
from receipt_categorizer import categorize_receipt

import base64
from firebase_admin import auth

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Function to verify the Firebase ID token
def verify_id_token(id_token):
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        raise ValueError(f"Invalid ID token: {e}")

# Route for predicting monthly budget
@app.route("/predict-budget", methods=["POST"])
def predict_budget():
    data = request.get_json()
    id_token = data.get("idToken")
    
    logger.debug("Received /predict-budget request")
    
    if not id_token:
        logger.error("Missing ID token")
        return jsonify({"error": "Missing Firebase ID token."}), 400

    try:
        # Verify the ID token
        logger.debug("Verifying ID token")
        decoded_token = verify_id_token(id_token)
        logger.debug(f"Token verified for user: {decoded_token['uid']}")
        
        # Perform prediction
        logger.debug("Calling aggregate_and_predict")
        result = aggregate_and_predict(id_token)
        logger.debug(f"Prediction result: {result}")
        if "error" in result:
            return jsonify(result), 400  
        return jsonify(result)

    except ValueError as e:
        logger.error(f"Value error: {e}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# Route for receipt processing
@app.route("/process-receipt", methods=["POST"])
def upload():
    logger.debug("Received /process-receipt request")
    
    if 'file' not in request.files:
        logger.error("No file part in request")
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    
    try:
        result = process_receipt_image(file)
        
        if result['success']:
            base64_image = result['processedImage']
            
            # Extract data from the receipt image
            total = extract_total(base64_image)
            date = extract_date(base64_image)
            formatted_date = format_date(date) if date else None
            
            # Extract and categorize items
            full_line_items = extract_line_items(base64_image)
            category_id = categorize_receipt(full_line_items)
            
            return jsonify({
                "message": "Upload successful",
                "processedImage": base64_image,
                "roboflowResults": result['roboflowResults'],
                "extractedTotal": total,
                "extractedDate": formatted_date,
                "extractedLineItems": full_line_items,
                "suggestedCategoryId": category_id
            })
        else:
            logger.error(f"Receipt processing failed: {result['error']}")
            return jsonify({"error": result['error']}), 400

    except Exception as e:
        logger.error(f"Unexpected error during receipt processing: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
