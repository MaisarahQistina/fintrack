import React from "react";
import styles from "./UserInfographicView.module.css";
import CardSlider from "./CardSlider";

function UserInfographicView() {
  return (
    <main className={styles.userInfographicView}> 
      <h2 className={styles.heading}>Infographics - Boost Your Financial Literacy !</h2>
      <CardSlider />
    </main>
  );
}

export default UserInfographicView;
