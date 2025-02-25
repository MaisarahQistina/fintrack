import React from 'react';
import styles from './ExpensesUpload.module.css';

export function ExpensesUpload() {
  return (
    <div className={styles.expensesMainPageView}>
      <div className={styles.viewBy}>View By :   
       <select name="year" id="year" className={styles.yearSelect}>
          <option value="">- Select Year -</option>
          <option value="2022">2022</option>
          <option value="2023">2023</option>
          <option value="2024">2024</option>
        </select>
      </div>
      <div className={styles.uploadContainer}>
        <div className={styles.iconWrapper}>
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/23619e4ab794bde9d5e6909cc0e42b6e3335cde8fffdeb9d78943204be94ff3c?placeholderIfAbsent=true&apiKey=dc1dfaeed34d4c05a46eb3603635944e"
            className={styles.uploadIcon}
            alt="Upload icon"
          />
        </div>
        <div className={styles.uploadInstructions}>
          <span style={{ fontFamily: 'NATS, sans-serif', fontWeight: 400 }}>
            Upload receipts
          </span>
          <span style={{ fontFamily: 'NATS, sans-serif', fontWeight: 400, color: 'rgba(0,0,0,1)' }}>
            {' '}
            to track your expenses.{' '}
          </span>
          <br />
          <span style={{ fontFamily: 'NATS, sans-serif', fontWeight: 400, color: 'rgba(0,0,0,1)' }}>
            Supported formats: JPEG, PDF (&lt;5MB)
          </span>
        </div>
        <div className={styles.uploadButtonWrapper}>
          <form>
            <label htmlFor="fileUpload" className={styles['visually-hidden']}>Upload Receipt</label>
            <input
              type="file"
              id="fileUpload"
              accept=".jpeg,.jpg,.pdf"
              className={styles['visually-hidden']}
            />
            <button className={styles.uploadButton} onClick={() => document.getElementById('fileUpload').click()}>
              Upload Receipt
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}