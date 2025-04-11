from flask import Flask, request, jsonify
from receipt_processor import process_receipt_image
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

@app.route('/process-receipt', methods=['POST'])
def upload():
    file = request.files['file']    
    result = process_receipt_image(file)
    
    if result['success']:
        return jsonify({
            "message": "Upload successful",
            "processedImage": result['processedImage'],
            "roboflowResults": result['roboflowResults']
        })
    else:
        return jsonify({
            "error": result['error']
        }), 400
    
if __name__ == "__main__":
    app.run(debug=True)
