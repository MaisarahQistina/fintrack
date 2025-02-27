import React from "react";
import styles from "./AdminHome.module.css";

const Card = ({ imageUrl, imageAlt, buttonText }) => {
  return (
    <div className={styles.cardWrapper}>
      <article className={styles.card}>
        <img src={imageUrl} alt={imageAlt} className={styles.cardImage} />
      </article>
      <button className={styles.cardButton}>{buttonText}</button>
    </div>
  );
};

export default Card;
