import React from "react";
import styles from "./AdminHome.module.css";
import { useNavigate } from "react-router-dom";

const Card = ({ imageUrl, imageAlt, buttonText, link }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.cardWrapper}>
      <article className={styles.card}>
        <img src={imageUrl} alt={imageAlt} className={styles.cardImage} />
      </article>
      <button className={styles.cardButton} onClick={() => navigate(link)}>
        {buttonText}
      </button>
    </div>
  );
};

export default Card;

