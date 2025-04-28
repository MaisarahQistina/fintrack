import base64
import cv2
import numpy as np
import pytesseract
import re
from datetime import datetime
from fuzzywuzzy import fuzz
from skimage.filters import threshold_local

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Extract Total Amount of receipt
def extract_total(base64_image):
    try:
        image_data = base64.b64decode(base64_image)
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        enhanced_image = image

        custom_config = r'--psm 6 --oem 3'

        extracted_text = pytesseract.image_to_string(enhanced_image, config=custom_config)
        extracted_text = re.sub(r'(\d)\s*\.\s*(\d{2})', r'\1.\2', extracted_text)

        print("Extracted Text:\n", extracted_text)

        # Try strict match for Grand Total
        grand_total_pattern = re.search(
            r'\bgrand\s+total\b[:\s]*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
            extracted_text.lower()
        )
        if grand_total_pattern:
            total_value = float(grand_total_pattern.group(1).replace(',', ''))
            print(f"Grand total match found: {total_value}")
            return total_value

        # Try match for generic Total 
        total_matches = re.findall(
            r'\btotal\b[:\s]*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
            extracted_text.lower()
        )
        if total_matches:
            total_value = float(total_matches[-1].replace(',', ''))
            formatted_total = "{:.2f}".format(total_value)
            print(f"Last total match found: {formatted_total}")
            return formatted_total

        ocr_data = pytesseract.image_to_data(enhanced_image, output_type=pytesseract.Output.DICT, config=custom_config)

        keywords = [
            'total', 'totl', 'tl', 'ttl', 'grand total', 'amount due', 'balance due', 'to-go',
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
                            formatted_total = "{:.2f}".format(amount)
                            print(f"Formatted potential total: {formatted_total}")
                            conf = int(ocr_data['conf'][i])
                            matched_totals.append((amount, conf, ocr_data['top'][i]))
                            print(f"Found potential total: {amount} (confidence: {conf}, keyword: {cleaned_word})")
                        except ValueError:
                            continue

        if matched_totals:
            # Sort by confidence then by vertical position 
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
            # Sort to find highest and also preserve order
            amounts_with_pos = [(amt, pos) for pos, amt in enumerate(valid_amounts)]
            highest = max(amounts_with_pos, key=lambda x: x[0])
            last = valid_amounts[-1]

            if highest[0] > 100 * last:
                print(f"Fallback - highest value too high, using last: {last}")
                return last
            else:
                print(f"Fallback - using last amount (likely final total): {last}")
                return last

        print("No amounts found.")
        return None

    except Exception as e:
        print("OCR Error:", str(e))
        return None

# Extract Date of receipt 
def extract_date(base64_image):
    try:
        image_data = base64.b64decode(base64_image)
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        custom_config = r'--psm 6 --oem 3'
        extracted_text = pytesseract.image_to_string(image, config=custom_config)
        
        # Date pattern list
        date_patterns = [
            r'(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})', # MM/DD/YYYY or MM-DD-YYYY
            r'([A-Za-z]{3,9}\.?\s+\d{1,2},?\s+\d{2,4})', # MMM DD, YYYY (Jan 01, 2023)
            r'(\d{1,2}[\-\.]\s*[A-Za-z]{3}[\-\.]\s*\d{2,4})', # DD-MMM-YYYY (01-Jan-2023)
            r'(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})', # YYYY-MM-DD (ISO format)
            r'(?:Date|DATE|Dt):?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})',
            r'(\d{1,2}[\-\.](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[\-\.]\d{2,4})',
            r'(\d{1,2}\-[A-Za-z]{3}\-\d{4})', # DD-MMM-YYYY (04-Nov-2018)
            r'(\d{1,2}\-[A-Za-z]{3}\-\d{4})' # 30-Aug-2019
            r'([A-Za-z]{3}[\/\-\.]\d{1,2}[\/\-\.]\d{4})'# Mon-DD-YYYY
        ]
        
        for pattern in date_patterns:
            matches = re.findall(pattern, extracted_text, re.IGNORECASE)
            if matches:
                print(f"Date found: {matches[0]}")
                return matches[0]
        
        # If no pattern matches, use OCR data for further inspection
        ocr_data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT, config=custom_config)
        
        date_indicators = ['date', 'dt', 'dated', 'receipt date']
        
        for i, word in enumerate(ocr_data['text']):
            cleaned_word = word.lower().strip()
            if any(indicator == cleaned_word or (cleaned_word.startswith(indicator) and cleaned_word[len(indicator):] in [':', ': ']) for indicator in date_indicators):
                line_num = ocr_data['line_num'][i]
                same_line = [ocr_data['text'][j] for j in range(len(ocr_data['text'])) if ocr_data['line_num'][j] == line_num]
                potential_date_text = ' '.join(same_line)
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

# Format date extracted
def format_date(extracted_date):
    try:
        date_obj = None
        for fmt in ['%m/%d/%Y', '%m/%d/%y', '%b %d, %Y', '%d-%b-%Y', '%Y-%m-%d', '%m-%d-%Y', '%m-%d-%y']:
            try:
                date_obj = datetime.strptime(extracted_date, fmt)
                break
            except ValueError:
                continue
        
        if date_obj:
            formatted_date = date_obj.strftime('%m/%d/%Y')  # Format to MM/DD/YYYY
            print(f"Formatted Date: {formatted_date}")  
            return formatted_date
        else:
            print("Date format not recognized.")
            return None
    except Exception as e:
        print(f"Error formatting date: {e}")
        return None

# Extract line items from receipt
def extract_line_items(base64_image):
    try:
        image_data = base64.b64decode(base64_image)
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        custom_config = r'--psm 6 --oem 3'
        extracted_text = pytesseract.image_to_string(image, config=custom_config)
        
        print("Full extracted text for line item processing:")
        print(extracted_text)
        
        # Split text into lines
        lines = extracted_text.split('\n')
        line_items = []
        
        # Identify sections of the receipt
        header_section = True
        footer_section = False
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Common header lines
            if header_section:
                if any(header in line.lower() for header in ['receipt', 'store', 'phone', 'address', 'tel', 'date', 'time', 'order', 'server', 'cashier', 'guests']): 
                    continue
                
                if re.search(r'\$?\d+\.\d{2}', line) or re.search(r'\d+\s*@\s*\$?\d+\.\d{2}', line):
                    header_section = False
            
            # Footer section
            if any(keyword in line.lower() for keyword in ['subtotal', 'tax', 'total', 'balance due', 'change', 'cash', 'credit', 'payment']):
                footer_section = True
                continue
                
            if not header_section and not footer_section:
                if re.search(r'\d', line) and len(line.split()) > 1:  
                    # Clean up the line & remove excessive whitespace
                    clean_line = re.sub(r'\s+', ' ', line).strip()
                    
                    # Remove any logos or non-item text by excluding specific patterns
                    if re.search(r'(facebook|twitter|logo)', clean_line, re.IGNORECASE):
                        continue

                    if clean_line:
                        line_items.append(clean_line)
        
        if line_items:
            result = '\n'.join(line_items)
            print(f"Extracted line items: {result}")
            return result
        else:
            print("No line items found, using full text as fallback")
            return extracted_text
        
    except Exception as e:
        print(f"Error extracting line items: {str(e)}")
        return ""
