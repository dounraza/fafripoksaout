import React from 'react';
import { Plus, Minus, Smile } from 'lucide-react';

const actionLabels = {
    fold: 'Coucher',
    check: 'Parole',
    call: 'Suivre',
};

const PlayerActions = ({
    tableState, betSize, setBetSize, emitPlayerAction, addRange, minusRange
}) => {
    if (!tableState.handInProgress || tableState.toAct !== tableState.seat) return null;
    return (
    <div className="player-action-container">
    <div className="action-container">
        {tableState.legalActions?.actions?.map((action) => (
            (action !== 'raise' && action !== 'bet') ? (
                <div 
                    key={action} 
                    className={`btn-${action === 'check' || action === 'call' ? 'call' : action}`}
                    onClick={() => emitPlayerAction(action)}
                >
                    {actionLabels[action] || action.charAt(0).toUpperCase() + action.slice(1)}
                </div>
            ) : null
        ))}
        <div className="btn-allin" onClick={() => emitPlayerAction('raise', Number(tableState.legalActions?.chipRange?.max || 0))}>
            Tapis
        </div>
    </div>
    <div className="input-group">
        <div className="bet-input-container">
            <div className="bet-control button-minus" onClick={minusRange}>
                <Minus />
            </div>
            <input
                className='bet-amount'
                style={{
                    backgroundColor: 'transparent',
                    border: '1px solid transparent'
                }}
                type="number"
                min={tableState.legalActions?.chipRange?.min || 0}
                max={tableState.legalActions?.chipRange?.max || 0}
                value={betSize}
                onChange={(e) => setBetSize(Number(e.target.value))}
            />
            <div className="bet-control button-plus" onClick={addRange}>
                <Plus />
            </div>
        </div>
        <div className="btn-raise" onClick={() => emitPlayerAction('raise')}>Miser/Relancer</div>
    </div>
   </div>
        
    );
};

export default PlayerActions;