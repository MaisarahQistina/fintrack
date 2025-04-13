from flask import Flask, request, jsonify
from receipt_processor import process_receipt_image
from receipt_reader import extract_total, extract_date, format_date
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

#Identifying and cropping uploaded receipt 
@app.route('/process-receipt', methods=['POST'])
def upload():
    file = request.files['file']    
    result = process_receipt_image(file)
    
    if result['success']:
        # Run OCR on the cropped image and get the results
        total = extract_total(result['processedImage'])
        date = extract_date(result['processedImage'])

        # Format the extracted date to MM/DD/YYYY
        formatted_date = format_date(date) if date else None

        return jsonify({
            "message": "Upload successful",
            "processedImage": result['processedImage'],
            "roboflowResults": result['roboflowResults'],
            "extractedTotal": total,
            "extractedDate": formatted_date
        })
    else:
        return jsonify({
            "error": result['error']
        }), 400

if __name__ == "__main__":
    app.run(debug=True)
