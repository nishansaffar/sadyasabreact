import { useState } from 'react';
//import './Card.css'; // optional: if card-specific styles are needed

const Card = ({ card, onPlay }) => {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 400); // 400ms animation
    onPlay(card);
  };

  return (
    <div className={`card${clicked ? ' clicked' : ''}`} onClick={handleClick}>
      {card}
    </div>
  );
};

export default Card;
