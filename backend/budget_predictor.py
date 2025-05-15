from firebase_admin import auth, firestore
from datetime import datetime
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_squared_error
import math
import firebase_admin
import os
import logging

logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK 
if not firebase_admin._apps:
    try:
        service_account_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "serviceAccountKey.json")
        from firebase_admin import credentials
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin SDK initialized successfully")
    except Exception as e:
        logger.error(f"Firebase initialization error: {e}", exc_info=True)

# Use the Firestore client
try:
    db = firestore.client()
    logger.info("Firestore client created successfully")
except Exception as e:
    logger.error(f"Firestore client error: {e}", exc_info=True)

def aggregate_and_predict(id_token):
    logger.debug("Starting aggregate_and_predict")

    try:
        # Verify token and get user ID
        decoded_token = auth.verify_id_token(id_token)
        user_id = decoded_token['uid']
        logger.debug(f"User ID: {user_id}")

        # Get current date
        current_date = datetime.now()

        # Get expenses data from receipt database
        receipts_ref = db.collection('Receipt').where('userID', '==', user_id)
        receipts = list(receipts_ref.stream())
        if len(receipts) == 0:
            return {"error": "No receipts found for this user."}

        monthly_data = {}
        for r in receipts:
            data = r.to_dict()
            try:
                date = datetime.strptime(data['receiptTransDate'], "%Y-%m-%d")
            except Exception as e:
                continue

            key = (date.year, date.month)
            amount = data['totalAmount']
            cat_id = data['systemCategoryID']

            if key not in monthly_data:
                monthly_data[key] = {'total': 0, 'categories': {}}
            monthly_data[key]['total'] += amount
            monthly_data[key]['categories'][cat_id] = monthly_data[key]['categories'].get(cat_id, 0) + amount

        sorted_months = sorted(monthly_data.keys())
        if len(sorted_months) < 1:
            return {"error": "Not enough data to train model"}

        totals = [monthly_data[k]['total'] for k in sorted_months]
        X = np.array(range(len(totals))).reshape(-1, 1)
        y = np.array(totals)

        model = LinearRegression()
        model.fit(X, y)

        r2 = r2_score(y, model.predict(X))
        rmse = math.sqrt(mean_squared_error(y, model.predict(X)))

        # Predict for the next month
        last_month_key = sorted_months[-1]
        year, month = last_month_key
        next_month = month + 1 if month < 12 else 1
        next_year = year if month < 12 else year + 1

        # Save all actuals
        for (yr, mo), data in monthly_data.items():
            actual_id = f"{user_id}_{yr}_{mo}"
            
            # Convert the categories dictionary to use string keys for Firestore
            category_actuals = {str(k): round(v, 2) for k, v in data['categories'].items()}
            
            db.collection('monthly_summaries').document(actual_id).set({
                'userID': user_id,
                'year': yr,
                'month': mo,
                'totalActual': round(data['total'], 2),
                'categoryActuals': category_actuals  # Using string keys now
            }, merge=True)

        logger.info(f"All actuals saved")

        # Only predict at the end of the current month (day >= 28)
        should_predict_next_month = current_date.day >= 28
        
        if should_predict_next_month:
            # Calculate next month
            next_month = current_date.month + 1 if current_date.month < 12 else 1
            next_year = current_date.year if current_date.month < 12 else current_date.year + 1
            
            # Check if prediction already exists
            prediction_id = f"{user_id}_{next_year}_{next_month}"
            prediction_ref = db.collection('monthly_summaries').document(prediction_id)
            doc = prediction_ref.get()
            
            if not doc.exists or 'totalPredicted' not in doc.to_dict():
                logger.info(f"Generating prediction for next month: {next_year}-{next_month}")
                
                # We'll use all data up to but not including this month
                months_before = sorted_months
                
                if len(months_before) >= 1:  # Need at least one point for prediction
                    # Train on all available data
                    previous_totals = [monthly_data[k]['total'] for k in months_before]
                    X_prev = np.array(range(len(previous_totals))).reshape(-1, 1)
                    y_prev = np.array(previous_totals)
                    model.fit(X_prev, y_prev)
                
                    # Predict for next month
                    total_pred = model.predict([[len(previous_totals)]])[0]
                    
                    # Get category predictions
                    category_predictions = {}
                    # Use categories from most recent month for prediction
                    latest_month = months_before[-1]
                    category_actuals = monthly_data[latest_month]['categories']
                    
                    for cat_id in category_actuals:
                        cat_vals = [monthly_data[k]['categories'].get(cat_id, 0) for k in months_before]
                        if len(set(cat_vals)) > 1:  # Only predict if we have variation in the data
                            model.fit(X_prev, cat_vals)
                            raw_pred = model.predict([[len(previous_totals)]])[0]
                            last_value = cat_vals[-1]
                            pred = max(0.9 * last_value, raw_pred)  # floor at 90% of last month
                            pred = max(0, round(pred, 2))
                        else:  # Otherwise use the most recent value
                            pred = cat_vals[-1]
                        category_predictions[str(cat_id)] = max(0, round(pred, 2))

                    # Adjust category predictions so they sum up to total_pred
                    sum_preds = sum(category_predictions.values())
                    if sum_preds > 0:
                        scale = total_pred / sum_preds
                        for cat_id in category_predictions:
                            category_predictions[cat_id] = round(category_predictions[cat_id] * scale, 2)
                    
                    # Save prediction
                    prediction_ref.set({
                        'userID': user_id,
                        'year': next_year,
                        'month': next_month,
                        'totalPredicted': round(total_pred, 2),
                        'categoryPredictions': category_predictions,
                        'modelMetrics': {
                            'r2': round(r2, 4),
                            'rmse': round(rmse, 2)
                        }
                    }, merge=True)
                    
                    logger.info(f"Prediction for {next_year}-{next_month} saved")
                    
                    return {
                        "message": f"Prediction for {next_year}-{next_month} generated successfully.",
                        "metrics": {"r2": round(r2, 4), "rmse": round(rmse, 2)}
                    }
                else:
                    logger.warning(f"Not enough data to predict for {next_year}-{next_month}")
            else:
                logger.info(f"Prediction already exists for {next_year}-{next_month}, skipping")
                return {
                    "message": f"Prediction for {next_year}-{next_month} already exists.",
                    "metrics": {"r2": round(r2, 4), "rmse": round(rmse, 2)}
                }
        else:
            logger.info(f"Not end of month yet (day {current_date.day}), skipping prediction")
            return {
                "message": "Actuals updated. No prediction generated (not end of month).",
                "metrics": {"r2": round(r2, 4), "rmse": round(rmse, 2)}
            }

    except Exception as e:
        logger.error(f"Error in aggregate_and_predict: {e}", exc_info=True)
        return {"error": str(e)}