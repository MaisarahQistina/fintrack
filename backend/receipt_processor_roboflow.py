import cv2
import numpy as np
import base64
from skimage.filters import threshold_local
from inference_sdk import InferenceHTTPClient
import tempfile
import os
from pdf2image import convert_from_path

POPPLER_PATH=r"C:\Users\60115\Downloads\Release-24.08.0-0\poppler-24.08.0\Library\bin"

def process_receipt_image(file):
    try:
        file.seek(0)
        file_bytes = file.read()
        
        # Always check file content first - PDF files start with %PDF
        is_pdf = file_bytes.startswith(b'%PDF')
        
        # If not detected by content, check extension as backup
        if not is_pdf:
            file_ext = file.name.split('.')[-1].lower() if '.' in file.name else ''
            is_pdf = file_ext == 'pdf'

        # Handle PDF
        if is_pdf:
            print(f"Processing PDF file, size: {len(file_bytes)} bytes")
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_pdf:
                temp_pdf.write(file_bytes)
                temp_pdf_path = temp_pdf.name

            try:
                images_from_pdf = convert_from_path(temp_pdf_path, poppler_path=POPPLER_PATH)
                print(f"PDF converted: {len(images_from_pdf)} pages")
            except Exception as e:
                print(f"Error converting PDF: {str(e)}")
                os.unlink(temp_pdf_path)
                return {'success': False, 'error': f'PDF conversion failed: {str(e)}'}
            
            os.unlink(temp_pdf_path)

            if not images_from_pdf:
                return {'success': False, 'error': 'No pages found in PDF'}

            # Convert PIL image to OpenCV format properly
            pil_image = images_from_pdf[0]  # Only first page
            print(f"PIL image mode: {pil_image.mode}, size: {pil_image.size}")
            
            # Convert PIL to numpy array
            pil_array = np.array(pil_image)
            print(f"PIL array shape: {pil_array.shape}, dtype: {pil_array.dtype}")
            
            # Handle different image modes
            if pil_image.mode == 'RGBA':
                # Convert RGBA to RGB first, then to BGR
                image = cv2.cvtColor(pil_array, cv2.COLOR_RGBA2BGR)
            elif pil_image.mode == 'RGB':
                # Convert RGB to BGR
                image = cv2.cvtColor(pil_array, cv2.COLOR_RGB2BGR)
            elif pil_image.mode == 'L':
                # Convert grayscale to BGR
                image = cv2.cvtColor(pil_array, cv2.COLOR_GRAY2BGR)
            else:
                # Try to convert to RGB first, then to BGR
                pil_image = pil_image.convert('RGB')
                pil_array = np.array(pil_image)
                image = cv2.cvtColor(pil_array, cv2.COLOR_RGB2BGR)
            
            print(f"OpenCV image shape: {image.shape}, dtype: {image.dtype}")
            
            # Ensure image is not empty and has correct data type
            if image is None or image.size == 0:
                return {'success': False, 'error': 'Failed to convert PDF page to image'}
            
            # Ensure proper data type
            image = image.astype(np.uint8)
        else:
            print(f"Processing image file, size: {len(file_bytes)} bytes")
            file_array = np.asarray(bytearray(file_bytes), dtype=np.uint8)
            image = cv2.imdecode(file_array, cv2.IMREAD_COLOR)
            if image is not None:
                print(f"Image loaded successfully, shape: {image.shape}")
            else:
                print("Failed to decode image file")

        # Additional check to ensure image is valid before proceeding
        if image is None or image.size == 0:
            return {'success': False, 'error': 'Failed to load or decode image'}

        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_file:
            temp_filename = temp_file.name
            cv2.imwrite(temp_filename, image)

        client = InferenceHTTPClient(
            api_url="https://detect.roboflow.com",
            api_key="2mvf2uYWpfSAaYILUNBI"
        )

        result = client.run_workflow(
            workspace_name="fintrack",
            workflow_id="detect-count-and-visualize",
            images={"image": temp_filename},
            use_cache=True
        )

        os.unlink(temp_filename)

        if not result or not isinstance(result, list) or len(result) == 0:
            return {'success': False, 'error': 'No results from Roboflow'}

        data = result[0]

        # 1. Check for dynamic_crop
        if 'dynamic_crop' in data and isinstance(data['dynamic_crop'], list) and len(data['dynamic_crop']) > 0:
            crop_data = data['dynamic_crop'][0]
            if 'crops' in crop_data and crop_data['crops']:
                crop_image = crop_data['crops']
                if crop_image.startswith('data:image/'):
                    crop_image = crop_image.split(',')[1]

                # Decode, enhance, re-encode
                decoded_crop = base64.b64decode(crop_image)
                nparr = np.frombuffer(decoded_crop, np.uint8)
                crop_img_np = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                _, buffer = cv2.imencode('.jpg', crop_img_np)
                encoded_enhanced = base64.b64encode(buffer).decode('utf-8')

                return {
                    'success': True,
                    'processedImage': encoded_enhanced,
                    'type': 'enhanced_cropped',
                    'roboflowResults': result
                }

        # 2. If don't work use output_image
        if 'output_image' in data and data['output_image']:
            encoded_image = data['output_image']
            if encoded_image.startswith('data:image/'):
                encoded_image = encoded_image.split(',')[1]
            return {
                'success': True,
                'processedImage': encoded_image,
                'type': 'output_image',
                'roboflowResults': result
            }

        # 3. Else fallback to drawing boxes
        if 'predictions' in data and 'predictions' in data['predictions']:
            for prediction in data['predictions']['predictions']:
                x = int(prediction['x'])
                y = int(prediction['y'])
                width = int(prediction['width'])
                height = int(prediction['height'])

                x1 = int(x - width / 2)
                y1 = int(y - height / 2)
                x2 = int(x + width / 2)
                y2 = int(y + height / 2)

                cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)

                if 'class' in prediction:
                    label = prediction['class']
                    cv2.putText(image, label, (x1, y1 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        _, buffer = cv2.imencode('.jpg', image)
        encoded_image = base64.b64encode(buffer).decode('utf-8')

        return {
            'success': True,
            'processedImage': encoded_image,
            'type': 'custom_drawn',
            'roboflowResults': result
        }

    except Exception as e:
        import traceback
        print(f"Error processing image: {str(e)}")
        print(traceback.format_exc())
        return {'success': False, 'error': str(e)}