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

        # Calculate model metrics if we have data
        r2 = 0
        rmse = 0
        if len(sorted_months) >= 1:
            totals = [monthly_data[k]['total'] for k in sorted_months]
            X = np.array(range(len(totals))).reshape(-1, 1)
            y = np.array(totals)

            model = LinearRegression()
            model.fit(X, y)

            r2 = r2_score(y, model.predict(X))
            rmse = math.sqrt(mean_squared_error(y, model.predict(X)))

        # 1. FIRST, GET ALL EXISTING MONTHLY SUMMARIES FOR THIS USER
        existing_summaries_ref = db.collection('monthly_summaries').where('userID', '==', user_id)
        existing_summaries = list(existing_summaries_ref.stream())
        
        # 2. SAVE ACTUALS FOR EVERY MONTH WITH RECEIPTS
        logger.info(f"Saving actuals for {len(monthly_data)} months")
        processed_months = set()
        
        for (yr, mo), data in monthly_data.items():
            actual_id = f"{user_id}_{yr}_{mo}"
            processed_months.add((yr, mo))
            
            # Convert the categories dictionary to use string keys for Firestore
            category_actuals = {str(k): round(v, 2) for k, v in data['categories'].items()}
            
            # Get existing document to preserve predictions
            existing_doc_ref = db.collection('monthly_summaries').document(actual_id)
            existing_doc = existing_doc_ref.get()
            existing_data = existing_doc.to_dict() if existing_doc.exists else {}
            
            # Prepare updated data
            updated_data = {
                'userID': user_id,
                'year': yr,
                'month': mo,
                'totalActual': round(data['total'], 2),
                'categoryActuals': category_actuals
            }
            
            # Preserve existing predictions if they exist
            if 'totalPredicted' in existing_data:
                updated_data['totalPredicted'] = existing_data['totalPredicted']
            if 'categoryPredictions' in existing_data:
                updated_data['categoryPredictions'] = existing_data['categoryPredictions']
            if 'modelMetrics' in existing_data:
                updated_data['modelMetrics'] = existing_data['modelMetrics']
            if 'predictionDate' in existing_data:
                updated_data['predictionDate'] = existing_data['predictionDate']
            
            # Save the updated document
            existing_doc_ref.set(updated_data)
            logger.debug(f"Saved actuals for {yr}-{mo:02d}: ${data['total']:.2f}")
        
        # 3. CLEAR ACTUALS FOR MONTHS THAT NO LONGER HAVE RECEIPTS
        months_to_clear = []
        for summary_doc in existing_summaries:
            summary_data = summary_doc.to_dict()
            doc_month = (summary_data['year'], summary_data['month'])
            
            # If this month has actuals but no longer has receipts, clear the actuals
            if 'totalActual' in summary_data and doc_month not in processed_months:
                months_to_clear.append((summary_doc.id, doc_month, summary_data))
        
        # Clear actuals for months without receipts
        for doc_id, (yr, mo), existing_data in months_to_clear:
            logger.info(f"Clearing actuals for {yr}-{mo:02d} (no receipts found)")
            
            # Remove actual fields but keep predictions
            updated_data = {k: v for k, v in existing_data.items() 
                          if k not in ['totalActual', 'categoryActuals']}
            
            # If no predictions exist either, delete the entire document
            if 'totalPredicted' not in updated_data:
                db.collection('monthly_summaries').document(doc_id).delete()
                logger.debug(f"Deleted empty summary for {yr}-{mo:02d}")
            else:
                # Keep the document but remove actuals
                db.collection('monthly_summaries').document(doc_id).set(updated_data)
                logger.debug(f"Cleared actuals for {yr}-{mo:02d}, kept predictions")

        logger.info(f"All actuals processed for {len(monthly_data)} months, cleared {len(months_to_clear)} months without receipts")

        # 4. CHECK IF TODAY IS THE 28TH - ONLY GENERATE PREDICTIONS ON 28TH
        predictions_generated = 0
        prediction_message = ""
        
        if current_date.day == 28:
            logger.info(f"Today is the 28th ({current_date.strftime('%Y-%m-%d')}), checking for next month prediction")
            
            # Generate prediction for ONLY the next month
            next_month = current_date.month + 1
            next_year = current_date.year
            
            # Handle year rollover
            if next_month > 12:
                next_month = 1
                next_year += 1
            
            target_year, target_month = next_year, next_month
            prediction_id = f"{user_id}_{target_year}_{target_month}"
            prediction_ref = db.collection('monthly_summaries').document(prediction_id)
            doc = prediction_ref.get()
            
            # Check if prediction already exists - DON'T overwrite existing predictions
            existing_data = doc.to_dict() if doc.exists else {}
            has_prediction = 'totalPredicted' in existing_data
            
            if not has_prediction:
                logger.info(f"Generating NEW prediction for {target_year}-{target_month:02d}")
                
                # Get historical data up to (but not including) the target month
                historical_months = [
                    (yr, mo) for (yr, mo) in sorted_months 
                    if (yr, mo) < (target_year, target_month)
                ]
                
                if len(historical_months) >= 1:
                    # Train model on historical data
                    historical_totals = [monthly_data[k]['total'] for k in historical_months]
                    X_hist = np.array(range(len(historical_totals))).reshape(-1, 1)
                    y_hist = np.array(historical_totals)
                    
                    prediction_model = LinearRegression()
                    prediction_model.fit(X_hist, y_hist)
                    
                    # Predict total for target month
                    total_pred = prediction_model.predict([[len(historical_totals)]])[0]
                    total_pred = max(0, total_pred)  # Ensure non-negative
                    
                    # Generate category predictions
                    category_predictions = {}
                    
                    if historical_months:
                        # Get all unique categories from historical data
                        all_categories = set()
                        for month_key in historical_months:
                            all_categories.update(monthly_data[month_key]['categories'].keys())
                        
                        for cat_id in all_categories:
                            # Get historical values for this category
                            cat_values = [
                                monthly_data[k]['categories'].get(cat_id, 0) 
                                for k in historical_months
                            ]
                            
                            if len(set(cat_values)) > 1:  # Has variation
                                cat_model = LinearRegression()
                                cat_model.fit(X_hist, cat_values)
                                cat_pred = cat_model.predict([[len(historical_totals)]])[0]
                                
                                # Apply floor at 90% of last known value
                                last_value = cat_values[-1]
                                cat_pred = max(0.9 * last_value, cat_pred)
                            else:
                                # Use most recent value if no variation
                                cat_pred = cat_values[-1] if cat_values else 0
                            
                            category_predictions[str(cat_id)] = max(0, round(cat_pred, 2))
                    
                    # Normalize category predictions to match total prediction
                    sum_cat_preds = sum(category_predictions.values())
                    if sum_cat_preds > 0:
                        scale_factor = total_pred / sum_cat_preds
                        for cat_id in category_predictions:
                            category_predictions[cat_id] = round(
                                category_predictions[cat_id] * scale_factor, 2
                            )
                    
                    # Prepare prediction data
                    prediction_data = {
                        'userID': user_id,
                        'year': target_year,
                        'month': target_month,
                        'totalPredicted': round(total_pred, 2),
                        'categoryPredictions': category_predictions,
                        'modelMetrics': {
                            'r2': round(r2, 4),
                            'rmse': round(rmse, 2)
                        },
                        'predictionDate': current_date.strftime('%Y-%m-%d')  # Track when prediction was made
                    }
                    
                    # Merge with existing actuals if they exist
                    if existing_data:
                        if 'totalActual' in existing_data:
                            prediction_data['totalActual'] = existing_data['totalActual']
                        if 'categoryActuals' in existing_data:
                            prediction_data['categoryActuals'] = existing_data['categoryActuals']
                    
                    # Save prediction
                    prediction_ref.set(prediction_data)
                    predictions_generated = 1
                    
                    logger.info(f"NEW prediction saved for {target_year}-{target_month:02d}: ${total_pred:.2f}")
                    prediction_message = f"New prediction generated for {target_month}/{target_year}."
                    
                else:
                    logger.warning(f"No historical data available for predicting {target_year}-{target_month:02d}")
                    prediction_message = f"No historical data available for predicting {target_month}/{target_year}."
            else:
                logger.info(f"Prediction already exists for {target_year}-{target_month:02d}, skipping")
                prediction_message = f"Prediction for {target_month}/{target_year} already exists, not overwriting."
            
        else:
            logger.info(f"Today is not the 28th (current day: {current_date.day}), skipping prediction generation")
            prediction_message = f"Predictions are only generated on the 28th of each month. Today is the {current_date.day}th."

        # Return summary
        return {
            "message": f"Actuals saved for {len(monthly_data)} months. {prediction_message}",
            "actuals_saved": len(monthly_data),
            "predictions_generated": predictions_generated,
            "is_prediction_day": current_date.day == 28,
            "current_date": current_date.strftime('%Y-%m-%d'),
            "metrics": {"r2": round(r2, 4), "rmse": round(rmse, 2)} if sorted_months else {"r2": 0, "rmse": 0}
        }

    except Exception as e:
        logger.error(f"Error in aggregate_and_predict: {e}", exc_info=True)
        return {"error": str(e)}