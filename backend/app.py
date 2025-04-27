from flask import Flask, request, jsonify
from receipt_processor import process_receipt_image
from receipt_reader import extract_total, extract_date, format_date, extract_line_items
from receipt_categorizer import categorize_receipt, load_model
from flask_cors import CORS
import base64

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Initialize the model when app starts
load_model()

# Identifying and cropping uploaded receipt 
@app.route('/process-receipt', methods=['POST'])
def upload():
    file = request.files['file']    
    result = process_receipt_image(file)
    
    if result['success']:
        base64_image = result['processedImage']
        
        # Extract receipt data
        total = extract_total(base64_image)
        date = extract_date(base64_image)
        formatted_date = format_date(date) if date else None
        
        # Receipt categorization
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
        return jsonify({
            "error": result['error']
        }), 400

if __name__ == "__main__":
    app.run(debug=True)