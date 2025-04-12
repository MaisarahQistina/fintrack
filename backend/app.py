from flask import Flask, request, jsonify
from receipt_processor import process_receipt_image
from receipt_reader import extract_total, extract_date
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

#Identifying and cropping uploaded receipt 
@app.route('/process-receipt', methods=['POST'])
def upload():
    file = request.files['file']    
    result = process_receipt_image(file)
    
    if result['success']:
        # Run OCR on the cropped image
        extract_total(result['processedImage'])
        extract_date(result['processedImage'])

        return jsonify({
            "message": "Upload successful",
            "processedImage": result['processedImage'],
            "roboflowResults": result['roboflowResults']
        })
    else:
        return jsonify({
            "error": result['error']
        }), 400
    
#Extracting text from uploaded receipt 

if __name__ == "__main__":
    app.run(debug=True)
