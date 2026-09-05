import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './RecaveModal.scss'; 

const RecaveModal = ({ isOpen, onClose, onRecave, onTimeout, minCave, defaultCave, timer }) => {
    const [cave, setCave] = useState(defaultCave || minCave);
    const [timeLeft, setTimeLeft] = useState(timer);

    useEffect(() => {
        if (!isOpen) return;
        setTimeLeft(timer);
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    if (onTimeout) onTimeout();
                    else onClose();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isOpen, timer, onTimeout, onClose]);

    if (!isOpen) return null;

    const handleRecave = () => {
        if (cave < minCave) return;
        onRecave(cave);
        onClose();
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        if (val === '') {
            setCave('');
        } else {
            const parsed = parseInt(val, 10);
            if (!isNaN(parsed)) {
                setCave(parsed);
            }
        }
    };

    return (
        <div className="recave-modal-overlay" onClick={onClose}>
            <div className="recave-modal-content cave-modal-premium" onClick={(e) => e.stopPropagation()}>
                <div className="modal-glow"></div>
                <div className="recave-modal-header modal-header">
                    <div className="table-icon">♠</div>
                    <h2>RECAVE ({timeLeft}s)</h2>
                    <div className="header-divider"></div>
                </div>
                <div className="recave-modal-body modal-body">
                    <div className="cave-display">
                        <label className="label">Montant de la cave :</label>
                        <div className="amount-wrapper">
                            <input 
                                type="number" 
                                value={cave} 
                                onChange={handleInputChange} 
                                min={minCave}
                                className="cave-input-premium"
                            />
                            <span className="currency">Ar</span>
                        </div>
                    </div>
                    <button className="rejoin-main-btn" onClick={handleRecave}>Ajouter des jetons</button>
                </div>
            </div>
        </div>
    );
};

export default RecaveModal;
