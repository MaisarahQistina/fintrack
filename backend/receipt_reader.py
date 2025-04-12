import base64
import cv2
import numpy as np
import pytesseract
import re
from fuzzywuzzy import fuzz
from skimage.filters import threshold_local

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

#Extract Total Amount of receipt
def extract_total(base64_image):
    try:
        image_data = base64.b64decode(base64_image)
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        enhanced_image = image

        custom_config = r'--psm 6 --oem 3'

        extracted_text = pytesseract.image_to_string(enhanced_image, config=custom_config)
        print("🔍 Extracted Text:\n", extracted_text)

        # First try strict match for Grand Total
        grand_total_pattern = re.search(
            r'\bgrand\s+total\b[:\s]*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
            extracted_text.lower()
        )
        if grand_total_pattern:
            total_value = float(grand_total_pattern.group(1).replace(',', ''))
            print(f"Grand total match found: {total_value}")
            return total_value

        # Try match for generic Total (skip Subtotal later)
        total_matches = re.findall(
            r'\btotal\b[:\s]*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
            extracted_text.lower()
        )
        if total_matches:
            total_value = float(total_matches[-1].replace(',', ''))
            print(f"✅ Last total match found: {total_value}")
            return total_value

        # Structured OCR
        ocr_data = pytesseract.image_to_data(enhanced_image, output_type=pytesseract.Output.DICT, config=custom_config)

        keywords = [
            'total', 'totl', 'tl', 'ttl', 'grand total', 'amount due', 'balance due',
            'final total', 'total amount', 'amount payable', 'total payable', 'total due'
        ]

        exclude_keywords = [
            'subtotal', 'sub-total', 'sub total', 'total savings', 'estimated total',
            'tax total', 'tax', 'discount', 'vat', 'change'
        ]

        matched_totals = []
        for i, word in enumerate(ocr_data['text']):
            cleaned_word = word.lower().strip()

            # Skip if word contains any exclude keyword
            if any(ex_kw in cleaned_word for ex_kw in exclude_keywords):
                continue

            # Fuzzy match against target keywords
            if any(fuzz.ratio(cleaned_word, kw) > 85 for kw in keywords):
                amt_candidates = []

                # Next word
                if i + 1 < len(ocr_data['text']):
                    amt_candidates.append(ocr_data['text'][i + 1])

                # Same line
                line_num = ocr_data['line_num'][i]
                same_line = [ocr_data['text'][j] for j in range(len(ocr_data['text']))
                             if ocr_data['line_num'][j] == line_num]
                amt_candidates.extend(same_line)

                # Next line
                next_line = [ocr_data['text'][j] for j in range(len(ocr_data['text']))
                             if ocr_data['line_num'][j] == line_num + 1]
                amt_candidates.extend(next_line)

                for candidate in amt_candidates:
                    match = re.search(r'\$?(\d{1,3}(?:,\d{3})*[\.:]\d{2})', candidate)
                    if match:
                        try:
                            amount_str = match.group(1).replace(',', '').replace(':', '.')
                            amount = float(amount_str)
                            conf = int(ocr_data['conf'][i])
                            matched_totals.append((amount, conf, ocr_data['top'][i]))
                            print(f"Found potential total: {amount} (confidence: {conf}, keyword: {cleaned_word})")
                        except ValueError:
                            continue

        if matched_totals:
            # Sort by confidence then by vertical position (lower = closer to bottom)
            matched_totals.sort(key=lambda x: (x[1], -x[2]), reverse=True)
            best_total = matched_totals[0][0]
            print(f"Best matched total: {best_total}")
            return best_total

        # Fallback: extract all float-looking numbers and return highest
        amounts = re.findall(r'\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)', extracted_text)
        valid_amounts = []
        for amt in amounts:
            try:
                value = float(amt.replace(',', ''))
                valid_amounts.append(value)
            except:
                continue

        if valid_amounts:
            valid_amounts.sort(reverse=True)
            if len(valid_amounts) > 1 and valid_amounts[0] > 5 * valid_amounts[1]:
                print(f"Fallback - highest value too high, using second: {valid_amounts[1]}")
                return valid_amounts[1]
            else:
                print(f"Fallback - selected amount: {valid_amounts[0]}")
                return valid_amounts[0]

        print("No amounts found.")
        return None

    except Exception as e:
        print("OCR Error:", str(e))
        return None

#Extract Date of receipt
def extract_date(base64_image):
    try:
        # Decode the base64 image
        image_data = base64.b64decode(base64_image)
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Use same OCR config as total extraction
        custom_config = r'--psm 6 --oem 3'
        extracted_text = pytesseract.image_to_string(image, config=custom_config)
        
        # Common date formats on receipts
        date_patterns = [
            # MM/DD/YYYY or MM-DD-YYYY
            r'(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})',
            # MMM DD, YYYY (Jan 01, 2023)
            r'([A-Za-z]{3,9}\.?\s+\d{1,2},?\s+\d{2,4})',
            # DD-MMM-YYYY (01-Jan-2023)
            r'(\d{1,2}[\-\.]\s*[A-Za-z]{3}[\-\.]\s*\d{2,4})',
            # YYYY-MM-DD (ISO format)
            r'(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})',
            # Special formats often found on receipts
            r'(?:Date|DATE|Dt):?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})',
            r'(\d{1,2}[\-\.](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[\-\.]\d{2,4})',
            # Format seen in your example: DD-MMM-YYYY (04-Nov-2018)
            r'(\d{1,2}\-[A-Za-z]{3}\-\d{4})',
            # Another format from examples: 30-Aug-2019
            r'(\d{1,2}\-[A-Za-z]{3}\-\d{4})'
        ]
        
        # Look for any date pattern
        for pattern in date_patterns:
            matches = re.findall(pattern, extracted_text, re.IGNORECASE)
            if matches:
                # Return the first found date
                print(f"Date found: {matches[0]}")
                return matches[0]
        
        # If no pattern matches directly, try a more structured approach using OCR data
        ocr_data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT, config=custom_config)
        
        # Look for date indicators
        date_indicators = ['date', 'dt', 'dated', 'receipt date']
        
        for i, word in enumerate(ocr_data['text']):
            cleaned_word = word.lower().strip()
            
            # Check if word is a date indicator
            if any(indicator == cleaned_word or 
                   (cleaned_word.startswith(indicator) and 
                    cleaned_word[len(indicator):] in [': ', ':']) 
                   for indicator in date_indicators):
                
                # Check next word and same line words
                line_num = ocr_data['line_num'][i]
                same_line = [ocr_data['text'][j] for j in range(len(ocr_data['text'])) 
                            if ocr_data['line_num'][j] == line_num]
                
                # Combine words on the line to form a potential date
                potential_date_text = ' '.join(same_line)
                
                # Check if any date pattern matches
                for pattern in date_patterns:
                    date_match = re.search(pattern, potential_date_text, re.IGNORECASE)
                    if date_match:
                        date_str = date_match.group(1)
                        print(f"Date found near indicator: {date_str}")
                        return date_str
        
        print("No date found on receipt.")
        return None
        
    except Exception as e:
        print(f"Date extraction error: {str(e)}")
        return None