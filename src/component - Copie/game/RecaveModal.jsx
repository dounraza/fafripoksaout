import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import './RecaveModal.scss'; // Vous devrez créer ce fichier scss

const RecaveModal = ({ isOpen, onClose, onRecave, minCave, defaultCave }) => {
    const [cave, setCave] = useState(defaultCave || minCave);

    useEffect(() => {
        setCave(defaultCave || minCave);
    }, [defaultCave, minCave]);

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
                    <h2>Recave</h2>
                    <button onClick={onClose}><X size={24}/></button>
                </div>
                <div className="recave-modal-body">
                    <label>Montant de la cave :</label>
                    <input 
                        type="number" 
                        value={cave} 
                        onChange={(e) => setCave(parseInt(e.target.value))} 
                        min={minCave} 
                    />
                    <button onClick={handleRecave}>Ajouter des jetons</button>
                </div>
            </div>
        </div>
    );
};

export default RecaveModal;
