# FinTrack: AI-Powered Finance & Expenses Tracking System

FinTrack is an AI-driven budget management system that evaluates users’ personal spending patterns on a monthly basis by the categorization of expenses. It provides tailored enlightenments for future budget planning using past spending behavior to recommend optimal resources allocations for various categories.

This project implements four different modules:
1. Monthly Spending Tracking Module:
- This module focuses on the main functionality of the system encompassing user uploading receipts, automated categorization of receipts into categories and date, computation of total expenditure for each category and budget recommendation for next month’s spendings. Receipt data extraction utilizes Tesseract OCR, BERT assists in classification of receipt into expenses categories and Linear Regression for budget predictions.
2. User Financial Profile Module:
- This module allows users to add and manage their user details when creating or updating their accounts respectively. Additionally, this module also comprises of a user-friendly dashboard that allows users to review, track and analyze their financial activities effectively. The dashboard presents users' spending patterns on a monthly and annual basis along with the recommended expenditure limits for different expense categories for that month.
3. Relief Labeling and Tracking Module:
- This module serves to assist eligible taxpayers according to their income brackets where the system identifies receipts that can be filed for relief through labeling and copying them to a designated folder allowing easy access for tax filing purposes. 
4. Infographic and Guide Module:
- This module displays infographics on topics such as what is financial management, importance of tracking expenses, tips for following a budget, common financial mistakes to avoid and an overview of the tax-filing journey in Malaysia.

## Intelligent Algorithms

Fintrack employs:

- Tesseract OCR: Extracts the information from receipts image or files into readable text.
- BERT as LLM: Analyzes the contextual meaning of receipt items to determine the appropriate receipt category.
- Linear Regression: Predicts the budget allocation for each category depending on past spending habits.

*Disclaimer: This project is developed for my Final-Year Project.

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
