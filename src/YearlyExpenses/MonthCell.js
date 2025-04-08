import { useNavigate, useLocation } from "react-router-dom";
import styles from "./YearlyExpensesView.module.css";

const MonthCell = ({ month, year }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    // Get month number (1-12) from month name
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthNumber = monthNames.indexOf(month) + 1;
    
    let yearToUse = year;
    if (!yearToUse) {
      const params = new URLSearchParams(location.search);
      yearToUse = params.get('year') || new Date().getFullYear().toString();
    }
    
    navigate(`/monthly-expenses?year=${yearToUse}&month=${monthNumber}`);
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