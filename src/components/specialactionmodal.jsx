// components/SpecialActionModal.jsx

const SpecialActionModal = ({ message, onClose }) => (
  <div className="modal-backdrop">
    <div className="modal special-modal">
      <h3>✨ Special Move</h3>
      <p>{message}</p>
      <button onClick={onClose}>Okay</button>
    </div>
  </div>
);

export default SpecialActionModal;
