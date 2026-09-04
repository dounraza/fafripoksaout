import React from 'react';
import './GameView.scss';

// Import des sous-composants nécessaires
import PlayerActions from './PlayerActions';
import TableAreaView from './TableAreaView';
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
    minusRange,
    jeton,
    jetonMany
}) => {
    console.log("GameView rendering. tableState:", tableState);
    console.log("Condition for PlayerActions:", tableState.handInProgress, tableState.toAct, tableState.seat);

    return (
        <div className="game-view-container">
            {/* Overlay pour forcer le mode paysage */}
            <div className="rotate-device-overlay">
                <div className="rotate-message">
                    Veuillez tourner votre appareil<br/>en mode paysage pour jouer
                </div>
            </div>

            {/* Player Actions (Forcé) */}
            {/* <PlayerActions
                tableState={tableState}
                betSize={betSize}
                setBetSize={setBetSize}
                emitPlayerAction={emitPlayerAction}
                addRange={addRange}
                minusRange={minusRange}
            /> */}

            <TableAreaView
                tableState={tableState}
                tableId={tableId}
                tableRef={tableRef}
                winData={winData}
                sb={sb}
                bb={bb}
                dealer={dealer}
                avatars={avatars}
                playerRefs={playerRefs}
                getSrcCard={getSrcCard}
                rever={rever}
                foldedPlayers={foldedPlayers}
                shouldShareCards={shouldShareCards}
                sharingCards={sharingCards}
                allInArr={allInArr}
                isRevealFinished={isRevealFinished}
                gameOver={gameOver}
                community={community}
                communityShow={communityShow}
                communityToShow={communityToShow}
                communityReversNb={communityReversNb}
                moveCommCards={moveCommCards}
                playSound={playSound}
                soundMute={soundMute}
            />

            {/* Pots */}
            <Pots
                tableState={tableState}
                playerRefs={playerRefs}
                potRef={potRef}
                animatePotToWinner={isRevealFinished && winData?.winStates?.some(w => w.isWinner)}
                winnerSeats={winData?.winStates?.filter(w => w.isWinner).map(w => w.seat) || []}
                playSound={playSound}
                shouldShareCards={shouldShareCards}
                jeton={jeton}
                jetonMany={jetonMany}
            />
        </div>
    );
};

export default GameView;
