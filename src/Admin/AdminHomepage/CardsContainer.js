import React from "react";
import Card from "./Card";
import styles from "./AdminHome.module.css";

const CardsContainer = () => {
  const cards = [
    {
      imageUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/92c082d118f56d989717e7052bcf65f649ed6ddb",
      imageAlt: "Tax Relief illustration",
      buttonText: "Tax Relief",
      link: "/tax-relief", // Placeholder route
    },
    {
      imageUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/e72b380da57f5f6e28d258ce1ea1f20092ea5800",
      imageAlt: "Infographics illustration",
      buttonText: "Infographics",
      link: "/infographics", // Placeholder route
    },
    {
      imageUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/7aee8ee68f67727a42995abdcb54f4c51b8f3287",
      imageAlt: "Feedbacks illustration",
      buttonText: "Feedbacks",
      link: "/admin-feedback", 
    },
  ];

  return (
    <section className={styles.cardsContainer}>
      {cards.map((card, index) => (
        <Card
          key={index}
          imageUrl={card.imageUrl}
          imageAlt={card.imageAlt}
          buttonText={card.buttonText}
          link={card.link}
        />
      ))}
    </section>
  );
};

export default CardsContainer;
