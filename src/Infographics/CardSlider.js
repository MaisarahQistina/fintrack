import React, { useState } from "react";
import styles from "./CardSlider.module.css";
import linkIcon from "./icons/link.png";
import enlargeIcon from "./icons/enlarge.png";

const cards = [
  { img: "/info.png", title: "Tax Relief in Malaysia 2024" },
  { img: "/cost.png", title: "7 Tips for Better Cost Control" },
  { img: "/info.png", title: "Tax Relief in Malaysia 2026" },
  { img: "/cost.png", title: "7 Tips for Better Cost Control" },
  { img: "/info.png", title: "Tax Relief in Malaysia 2028" },
  { img: "/cost.png", title: "7 Tips for Better Cost Control" },
];

function CardSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const handleNext = () => {
    setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0)); // Loop back to first card
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1)); // Loop to last card
  };

  const openResourceLink = (url) => {
    window.open(url, "_blank"); // Opens link in a new tab
  };

  const openImage = (imgSrc) => {
    window.open(imgSrc, "_blank"); // Opens image in a new tab
  };

  const translateValue = -currentIndex * 100;

  return (
    <div className={styles.sliderContainer}>
      <button className={styles.arrow} onClick={handlePrev}>
        &#10094;
      </button>

      <div className={styles.viewportContainer}>
        <div 
          className={styles.carouselTrack}
          style={{
            transform: `translateX(${translateValue}%)`,
          }}
        >
          {cards.map((card, index) => (
            <div
              key={index}
              className={`${styles.card} ${index === currentIndex ? styles.active : ''}`}
            >
              <div className={styles.imageContainer}>
                <img src={card.img} alt={card.title} className={styles.image} />
              </div>
              <h3 className={styles.title}>{card.title}</h3>
              <div className={styles.iconContainer}>
              <img
                src={enlargeIcon}
                alt="Enlarge"
                className={styles.icon}
                onClick={() => openImage(card.img)}
              />
              <img
                src={linkIcon}
                alt="Resource Link"
                className={styles.icon}
                onClick={() => openResourceLink(card.link)}
              />
            </div>
            </div>
          ))}
        </div>
      </div>

      <button className={styles.arrow} onClick={handleNext}>
        &#10095;
      </button>

      <div className={styles.imageIndicator}>
        {currentIndex + 1} / {cards.length}
      </div>
    </div>
  );
}

export default CardSlider;