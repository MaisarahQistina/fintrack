import cv2
import numpy as np
import base64
from inference_sdk import InferenceHTTPClient
import tempfile
import os

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
                return {
                    'success': True,
                    'processedImage': crop_image,
                    'type': 'cropped',
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
