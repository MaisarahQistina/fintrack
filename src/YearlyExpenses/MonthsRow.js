import styles from "./YearlyExpensesView.module.css";

const MonthCell = ({ month }) => {
    return (
      <article className={styles[month.toLowerCase()]} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <img src="/folder.png" alt="Folder Icon" width="100" height="100" />
        <h3>{month}</h3>
      </article>
    );
  };  

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
