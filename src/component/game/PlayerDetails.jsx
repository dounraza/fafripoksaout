import React from 'react';
import { Smile } from "lucide-react";

const PlayerDetails = ({ 
    i, 
    tableState, 
    winData, 
    dealer, 
    sb, 
    bb, 
    foldedPlayers, 
    chips, 
    showResult, 
    isRevealFinished,
    tableId,
    setSmileysOpen,
    smiley,
    playerSmileys,
    sendSmiley,
    tableStateSeat
}) => {
    return (
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Statut de l'action */}
            <div className="player-action-status">
                {(() => {
                    if (foldedPlayers.current.has(i)) {
                        return <div className="action-badge badge-fold">Fold</div>;
                    }
                    const playerAction = tableState.actions?.find(item => item.playerId === i);
                    if (playerAction && playerAction.action !== 'fold') {
                        const action = playerAction.action;
                        let badgeClass = "badge-call";
                        let label = action;
                        if (action === 'raise' || action === 'bet') {
                            badgeClass = "badge-raise";
                            label = "Raise";
                        } else if (action === 'call') {
                            badgeClass = "badge-call";
                            label = "Call";
                        } else if (action === 'check') {
                            badgeClass = "badge-call";
                            label = "Check";
                        }
                        return <div className={`action-badge ${badgeClass}`} key={i}>{label}</div>;
                    }
                    return null;
                })()}
            </div>

            {/* Nom du joueur et Dealer/Blinds */}
            <div className="player-name" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minWidth: '120px' }}>
                <div>
                    {(tableState.playerNames?.[i] ?? '').length > 10
                        ? tableState.playerNames[i].slice(0, 10) + '...'
                        : (tableState.playerNames?.[i] || '')}
                </div>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {dealer === i && <span style={{ backgroundColor: 'white', color: 'black', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 'bold', border: '1px solid #ccc' }}>D</span>}
                    {sb === i && <span style={{ backgroundColor: 'blue', color: 'white', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 'bold' }}>SB</span>}
                    {bb === i && <span style={{ backgroundColor: 'red', color: 'white', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 'bold' }}>BB</span>}
                </div>
            </div>

            {/* Barre de séparation - masquée si le siège est vide */}
            {tableState.seats[i] !== null && (
                <div style={{ height: 2, width: '55%', backgroundColor: '#00FF99', marginTop: 2, marginBottom: 2, borderRadius: 2, boxShadow: tableState.toAct === i ? '0px 0px 12px 4px #00FF99' : 'none' }}></div>
            )}

            {/* Tapis/Stack - masqué si le siège est vide */}
            <div className={`amount p_${i}`}>
                {tableState.seats[i] !== null && (() => {
                    const playerAction = tableState.actions?.find(item => item.playerId === i);
                    if (playerAction) {
                        return (
                            <>
                                <div key={i} style={{ color: 'white', fontWeight: 600 }}>
                                    {playerAction.action === 'check' || playerAction.action === 'fold' ? '' : `${playerAction.amount}`}
                                </div>
                                {playerAction.amount > 0 && <div className="jeton"><img src={require("../../styles/image/jeton.png")} alt="" /></div>}
                            </>
                        );
                    }
                })()}
            </div>

            {/* Affichage permanent du solde */}
            <div className="stacks" style={{ opacity: 1, visibility: 'visible', color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>
                {showResult ? (
                    winData?.winStates?.find(w => w.seat === i)?.isWinner ? (
                        <div className="hand-name-result" style={{ color: '#00FF99', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            {winData.winStates.find(w => w.seat === i).handName}
                        </div>
                    ) : (
                        <div className="hand-name-result lose-badge" style={{ backgroundColor: '#888888', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase',display: 'none' }}>
                            {foldedPlayers.current.has(i) ? 'Fold' : 'Lose'}
                        </div>
                    )
                ) : (
                    <>{tableState.seats[i] !== null ? (chips != null ? `${chips.stack}` : <div className="no-chips" style={{ opacity: 0.7 }}>0</div>) : null}</>
                )}
            </div>

            {/* Countdown */}
            {tableState.toAct === i && (
                <div className="turn-countdown-container">
                    <div className="turn-countdown-bar"></div>
                </div>
            )}

            {/* Smiley button */}
            <div
                style={{ zIndex: 9999, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40 }}
                onClick={() => tableStateSeat === i && setSmileysOpen(true)}
            >
                {tableStateSeat === i ? (
                    smiley ? <div><img src={smiley} alt="Smiley" style={{ width: '100%', borderRadius: '4pt' }} /></div> : <Smile size={32} fill='#ff9100ff' />
                ) : (
                    playerSmileys.find(s => s.seat === i) && <div><img src={playerSmileys.find(s => s.seat === i).smiley} alt="Smiley" style={{ width: '100%', borderRadius: '4pt' }} /></div>
                )}
            </div>

            {/* Animation tonnerre pour les perdants */}
            {(() => {
                const playerWinState = winData?.winStates?.find(w => w.seat === i);
                const isOccupied = tableState.seats[i] !== null;
                const isFolded = foldedPlayers.current.has(i);
                
                if (isOccupied && !isFolded && playerWinState && playerWinState.isWinner === false && isRevealFinished) {
                    return <div className="thunder-animation-icon">⚡</div>;
                }
                return null;
            })()}
        </div>
    );
};

export default PlayerDetails;
