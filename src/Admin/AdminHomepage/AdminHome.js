import React from "react";
import CardsContainer from "./CardsContainer";
import styles from "./AdminHome.module.css";

function AdminHome() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Abhaya+Libre:wght@700&family=Montserrat:wght@600;700&display=swap"
        rel="stylesheet"
      />
      <main className={styles.pageContainer}>
        <section className={styles.welcomeSection}>Welcome, Admin!</section>;
        <CardsContainer />
      </main>
    </>
  );
}

export default AdminHome;
