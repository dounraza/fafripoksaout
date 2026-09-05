import React from 'react';
import rever from "../../styles/image/rever.png";

const Chair = ({ i, isActive }) => {
    return (
        <div className={`seat seat-${i} chair-${i} ${!isActive ? 'chair-inactive' : ''}`} style={{ zIndex: 1 }}>
            {/* Placeholder pour siège vide avec bordure pointillée */}
            {!isActive && (
                <div className="seat-placeholder" style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    border: '3px dashed rgba(255, 255, 255, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255, 255, 255, 0.3)',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    gap: '5px'
                }}>
                    +
                    {/* Placeholder pour une carte fictive, plus grand */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <div style={{ width: '20px', height: '28px', border: '1px dashed rgba(255, 255, 255, 0.4)', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={rever} alt="card" style={{ width: '100%', height: '100%', opacity: 0.6 }} />
                        </div>
                        <div style={{ width: '20px', height: '28px', border: '1px dashed rgba(255, 255, 255, 0.4)', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={rever} alt="card" style={{ width: '100%', height: '100%', opacity: 0.6 }} />
                        </div>
                    </div>
                </div>
            )}
            
            {/* Dossier de la chaise */}
            <div className="chair-back"></div>
            
            {/* Bras de la chaise */}
            <div className="chair-arm chair-arm-left"></div>
            <div className="chair-arm chair-arm-right"></div>
        </div>
    );
};

export default Chair;
