import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import './RecaveModal.scss'; // Vous devrez créer ce fichier scss

const RecaveModal = ({ isOpen, onClose, onRecave, minCave, defaultCave }) => {
    const [cave, setCave] = useState(defaultCave || minCave);
    const [timeLeft, setTimeLeft] = useState(10);

    useEffect(() => {
        if (!isOpen) return;
        
        setTimeLeft(10);
        const interval = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen]);

    if (!isOpen) return null;

    const handleRecave = () => {
        if (cave < minCave) {
            return;
        }
        onRecave(cave);
        onClose();
    };

    return (
        <div className="recave-modal-overlay" onClick={onClose}>
            <div className="recave-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="recave-modal-header">
                    <h2>Recharger</h2>
                    <button onClick={onClose}><X size={24}/></button>
                </div>
                <div className="recave-modal-body">
                    <label>Montant de la recharge :</label>
                    <input 
                        type="number" 
                        value={cave} 
                        onChange={(e) => setCave(parseInt(e.target.value))} 
                        min={minCave} 
                    />
                    <button onClick={handleRecave}>Ajouter des jetons</button>
                    <p className="timer-text">Vous serez exclu dans {timeLeft}s</p>
                </div>
            </div>
        </div>
    );
};

export default RecaveModal;
