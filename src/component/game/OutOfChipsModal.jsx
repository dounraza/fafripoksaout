import React from 'react';
import './OutOfChipsModal.scss';

const OutOfChipsModal = ({ isOpen, onLeave }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Vous n'avez plus de jetons !</h2>
                <p>Votre stack est à 0.</p>
                <button onClick={onLeave}>Quitter la table</button>
            </div>
        </div>
    );
};

export default OutOfChipsModal;
