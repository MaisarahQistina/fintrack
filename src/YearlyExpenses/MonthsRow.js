import MonthCell from "./MonthCell";
import styles from "./YearlyExpensesView.module.css";

const MonthsRow = ({ months }) => {
  return (
    <section className={styles.monthsRowContainer}>
      <div className={styles.monthsBackground} />
      <div className={styles.monthsGrid}>
        {months.map((month) => (
          <MonthCell key={month} month={month} />
        ))}
      </div>
    </section>
  );
};

export default MonthsRow;
