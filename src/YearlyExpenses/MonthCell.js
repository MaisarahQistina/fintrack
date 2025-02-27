import { useNavigate } from "react-router-dom";
import styles from "./YearlyExpensesView.module.css";

const MonthCell = ({ month }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/monthly-expenses?month=${month}`);
  };

  return (
    <article
      className={styles[month.toLowerCase()]}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
      onClick={handleClick}
    >
      <img src="/folder.png" alt="Folder Icon" width="100" height="100" />
      <h3>{month}</h3>
    </article>
  );
};

export default MonthCell;
