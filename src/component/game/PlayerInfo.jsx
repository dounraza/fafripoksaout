import React from 'react';

const PlayerInfo = ({ i, children }) => {
    return (
        <div className={`player-info-container player-info-${i}`} style={{ zIndex: 10 }}>
            {children}
        </div>
    );
};

export default PlayerInfo;
