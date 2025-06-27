// components/SadyaTray.jsx

const SadyaTray = ({ placedCards }) => (
  <div className="tray">
    <h3>Your Sadya Tray 🍽️</h3>
    <div className="tray-cards">
      {placedCards.map((c, i) => (
        <div key={i} className="tray-card">{c}</div>
      ))}
    </div>
  </div>
);

export default SadyaTray;
