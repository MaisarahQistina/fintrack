import React from "react";
import CardsContainer from "./CardsContainer";
import styles from "./AdminHome.module.css";

function AdminHome() {
  return (
    <>
      <main>
        <section className={styles.welcomeSection}>Welcome, Admin!</section>;
        <CardsContainer />
      </main>
    </>
  );
}

export default AdminHome;
