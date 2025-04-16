import MonthCell from "./MonthCell";
import styles from "./YearlyExpensesView.module.css";

const MonthsRow = ({ months, year, receiptCounts }) => {
  return (
    <section className={styles.monthsRowContainer}>
      <div className={styles.monthsBackground} />
      <div className={styles.monthsGrid}>
        {months.map((month) => (
          <MonthCell 
            key={month} 
            month={month} 
            year={year}
            receiptCount={receiptCounts ? receiptCounts[month] : 0}
          />
        ))}
      </div>
    </section>
  );
};

export default MonthsRow;