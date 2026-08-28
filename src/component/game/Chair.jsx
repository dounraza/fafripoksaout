import React from 'react';

const Chair = ({ i, isActive }) => {
    return (
        <div className={`seat seat-${i} chair-${i} ${!isActive ? 'chair-inactive' : ''}`} style={{ zIndex: 1 }}>
            {/* Dossier de la chaise */}
            <div className="chair-back"></div>
            
            {/* Bras de la chaise */}
            <div className="chair-arm chair-arm-left"></div>
            <div className="chair-arm chair-arm-right"></div>
        </div>
    );
};

export default Chair;
