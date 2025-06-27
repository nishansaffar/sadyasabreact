// components/CardSelectorModal.js
//import './CardSelectorModal.css'; // optional for styling

const CardSelectorModal = ({ hand, onSelect, onCancel, title }) => (
  <div className="modal-backdrop">
    <div className="modal">
      <h3>{title}</h3>
      <div className="hand modal-hand">
        {hand.map((card, i) => (
          <div key={i} className="card" onClick={() => onSelect(card)}>
            {card}
          </div>
        ))}
      </div>
      <button onClick={onCancel}>Cancel</button>
    </div>
  </div>
);

export default CardSelectorModal;
