import React from 'react';
import './GameView.scss';

// Import des sous-composants nécessaires
import PlayerActions from './PlayerActions';
import Chair from './Chair';
import PlayerInfo from './PlayerInfo';
import Player from './Player';
import CommunityCards from './CommunityCards';
import Pots from './Pots';

const GameView = ({
    tableState,
    tableId,
    game,
    community,
    communityShow,
    communityToShow,
    communityReversNb,
    moveCommCards,
    gameOver,
    allInArr,
    winData,
    getSrcCard,
    playSound,
    soundMute,
    isRevealFinished,
    playerRefs,
    tableRef,
    rever,
    foldedPlayers,
    shouldShareCards,
    sharingCards,
    hideStack,
    sb,
    bb,
    dealer,
    avatars,
    potRef,
    // Nouveaux props pour PlayerActions
    betSize,
    setBetSize,
    emitPlayerAction,
    addRange,
    minusRange
}) => {
    console.log("GameView rendering. tableState:", tableState);
    console.log("Condition for PlayerActions:", tableState.handInProgress, tableState.toAct, tableState.seat);

    return (
        <div className="game-view-container">
            {/* Player Actions (Forcé) */}
            <PlayerActions
                tableState={tableState}
                betSize={betSize}
                setBetSize={setBetSize}
                emitPlayerAction={emitPlayerAction}
                addRange={addRange}
                minusRange={minusRange}
            />

            <div className="table-area" ref={tableRef}>
                {/* Visualisation de la table (tapis vert + LED) */}
                <div className="table-visual" style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '800px',
                    height: '280px',
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '150px',
                    background: 'radial-gradient(ellipse at center, #065a2e 0%, #043d20 100%)',
                    border: '8px solid #1a3c6d', // Bordure LED bleue
                    boxShadow: '0 0 20px rgba(0, 100, 255, 0.5), inset 0 0 50px rgba(0,0,0,0.5)',
                    zIndex: 0
                }}></div>

                {/* Logo and Table Name */}
                <div className="table-branding" >
                    <img src="/caf.png" alt="Logo"  className="table-logo"  width='10%'/>
                    <h1 className="table-name">Afripoks</h1>
                </div>
                {/* Les chaises (décor uniquement) */}
                <div className="chairs-container">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <Chair key={i} i={i} isActive={tableState.activeSeats?.includes(i)} />
                    ))}
                </div>

                {/* Les infos joueurs (sur le tapis) */}
                <div className="players-info-container">
                    {tableState.seats && tableState.seats.map((chips, i) => (
                        <PlayerInfo key={i} i={i}>
                            <Player
                                i={i}
                                chips={chips}
                                tableState={tableState}
                                winData={winData}
                                sb={sb}
                                bb={bb}
                                dealer={dealer}
                                avatars={avatars}
                                playerRefs={playerRefs}
                                tableRef={tableRef}
                                getSrcCard={getSrcCard}
                                rever={rever}
                                foldedPlayers={foldedPlayers}
                                shouldShareCards={shouldShareCards}
                                sharingCards={sharingCards}
                                allInArr={allInArr}
                                isRevealFinished={isRevealFinished}
                                gameOver={gameOver}
                                hideStack={hideStack}
                                tableId={tableId}
                            />
                        </PlayerInfo>
                    ))}
                </div>

                {/* Cartes communes au centre */}
                <div className="community-cards-container">
                    <CommunityCards
                        key={tableId}
                        community={community}
                        communityShow={communityShow}
                        communityToShow={communityToShow}
                        communityReversNb={communityReversNb}
                        moveCommCards={moveCommCards}
                        gameOver={gameOver}
                        allInArr={allInArr}
                        winData={winData}
                        getSrcCard={getSrcCard}
                        playSound={playSound}
                        soundMute={soundMute}
                        isRevealFinished={isRevealFinished}
                        tableId={tableId}
                    />
                </div>
            </div>

            {/* Pots */}
            <Pots
                tableState={tableState}
                playerRefs={playerRefs}
                potRef={potRef}
                animatePotToWinner={isRevealFinished && winData?.winStates?.some(w => w.isWinner)}
                winnerSeats={winData?.winStates?.filter(w => w.isWinner).map(w => w.seat) || []}
                playSound={playSound}
                shouldShareCards={shouldShareCards}
            />
        </div>
    );
};

export default GameView;
