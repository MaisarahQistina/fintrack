import React from "react";
import styles from "./UserInfographicView.module.css";
import CardSlider from "./CardSlider";

function UserInfographicView() {
  return (
    <main className={styles.userInfographicView}> 
      <h2 className={styles.heading}>Financial Tips - Infographics to Boost Your Financial Literacy !</h2>
      <div className={styles.subtitle}>
        Use the enlarge button to zoom in and explore each infographic in detail.  
        Tap the link icon for additional insights and resources on the topic.
      </div>
      <CardSlider />
    </main>
  );
}

export default UserInfographicView;
