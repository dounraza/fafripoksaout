import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './RecaveModal.scss';

const RecaveModal = ({ isOpen, onClose, onRecave, onQuit, minCave, defaultCave }) => {
    // Convert to numbers immediately
    const safeMinCave = Number(minCave || 0);
    const safeDefaultCave = Number(defaultCave || safeMinCave);

    const [cave, setCave] = useState(safeDefaultCave);
    const [timeLeft, setTimeLeft] = useState(10);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Refresh values when modal opens
            setCave(safeDefaultCave);
            setTimeLeft(10);
            setIsSubmitting(false);
            
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            
            return () => clearInterval(timer);
        }
    }, [isOpen, safeDefaultCave]);

    if (!isOpen) return null;

    const handleRecave = () => {
        if (isSubmitting) return;
        const numericCave = Number(cave);
        if (numericCave < safeMinCave) {
            return;
        }
        setIsSubmitting(true);
        onRecave(numericCave);
        onClose();
    };

    const handleQuitDefinitivement = () => {
        if (onQuit) {
            onQuit();
        }
        onClose();
    };

    return (
        <div className="recave-modal-overlay" onClick={onClose}>
            <div className="recave-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="recave-modal-header">
                    <h2>Recave</h2>
                    <button onClick={onClose}><X size={24}/></button>
                </div>
                <div className="recave-modal-body">
                    <div className="countdown">Temps restant : {timeLeft}s</div>
                    <label>Montant de la cave :</label>
                    <input 
                        type="number" 
                        value={cave} 
                        onChange={(e) => setCave(e.target.value)} 
                        min={safeMinCave} 
                    />
                    <div className="default-value-info">
                        Valeur par défaut : {safeDefaultCave.toLocaleString()} Ar (Min: {safeMinCave.toLocaleString()} Ar)
                    </div>
                    <div className="recave-buttons">
                        <button className="btn-recave-yellow" onClick={handleRecave}>Ajouter des jetons</button>
                        <button className="btn-recave-quit" onClick={handleQuitDefinitivement}>Quitter définitivement</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecaveModal;
