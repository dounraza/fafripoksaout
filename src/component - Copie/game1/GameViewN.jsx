import React from 'react';
import './GameView.scss';
import TableAreaView from './TableAreaView';

const GameViewN = (props) => {
    return (
        <div className="game-view-n-container">
            <TableAreaView {...props} />
        </div>
    );
};

export default GameViewN;
