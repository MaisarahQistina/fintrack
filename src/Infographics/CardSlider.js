import React, { useEffect, useState } from "react";
import styles from "./CardSlider.module.css";
import linkIcon from "./icons/link.png";
import enlargeIcon from "./icons/enlarge.png";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Adjust the path as needed

function CardSlider() {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchInfographics = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Infographics"));
        const fetchedCards = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setCards(fetchedCards);
      } catch (error) {
        console.error("Error fetching infographics:", error);
      }
    };

    fetchInfographics();
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
  };

  const openResourceLink = (url) => {
    if (url) window.open(url, "_blank");
  };

  const openImage = (imgSrc) => {
    window.open(imgSrc, "_blank");
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
              key={card.id || index}
              className={`${styles.card} ${index === currentIndex ? styles.active : ''}`}
            >
              <div className={styles.imageContainer}>
                <img src={card.imageUrl} alt={card.title} className={styles.image} />
              </div>
              <h3 className={styles.title}>{card.title}</h3>
              <div className={styles.iconContainer}>
              <div className={styles.iconWrapper}>
                <img
                  src={enlargeIcon}
                  alt="Enlarge"
                  className={styles.icon}
                  onClick={() => openImage(card.imageUrl)}
                />
                <span className={styles.iconLabel}>Enlarge Image</span>
              </div>
              <div className={styles.iconWrapper}>
                <img
                  src={linkIcon}
                  alt="Resource Link"
                  className={styles.icon}
                  onClick={() => openResourceLink(card.resourceLink)}
                />
                <span className={styles.iconLabel}>Open Resource Link</span>
              </div>
            </div>

            </div>
          ))}
        </div>
      </div>

      <button className={styles.arrow} onClick={handleNext}>
        &#10095;
      </button>

      <div className={styles.imageIndicator}>
        {cards.length > 0 ? `${currentIndex + 1} / ${cards.length}` : "Loading..."}
      </div>
    </div>
  );
}

export default CardSlider;
