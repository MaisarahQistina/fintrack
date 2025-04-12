import cv2
import numpy as np
import base64
from skimage.filters import threshold_local
from inference_sdk import InferenceHTTPClient
import tempfile
import os

def enhance_receipt_for_ocr(image):
    """
    Enhance receipt image quality specifically for OCR processing
    """
    # Convert to grayscale if the image is in color
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image

    # Apply adaptive thresholding
    T = threshold_local(gray, 21, offset=5, method="gaussian")
    bw = (gray > T).astype("uint8") * 255

    # Denoise the binary image
    denoised = cv2.fastNlMeansDenoising(bw, None, 20, 7, 21)

    # Adjust contrast and brightness
    alpha = 1.3  # Reduced contrast adjustment
    beta = 5     # Reduced brightness adjustment
    enhanced = cv2.convertScaleAbs(denoised, alpha=alpha, beta=beta)

    # Apply sharpening filter with a milder kernel
    kernel = np.array([[0, -1, 0],
                       [-1, 5, -1],
                       [0, -1, 0]])
    sharpened = cv2.filter2D(enhanced, -1, kernel)

    # Clean up small black blobs using morphological opening
    kernel_morph = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
    cleaned = cv2.morphologyEx(sharpened, cv2.MORPH_OPEN, kernel_morph)

    return cleaned

def process_receipt_image(file):
    try:
        file.seek(0)
        file_bytes = np.asarray(bytearray(file.read()), dtype=np.uint8)
        image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

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
                enhanced_img = enhance_receipt_for_ocr(crop_img_np)
                _, buffer = cv2.imencode('.jpg', enhanced_img)
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
