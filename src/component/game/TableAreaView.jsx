import React from 'react';
import Chair from './Chair';
import PlayerInfo from './PlayerInfo';
import Player from './Player';
import CommunityCards from './CommunityCards';

const TableAreaView = ({
    tableState,
    tableId,
    tableRef,
    winData,
    sb,
    bb,
    dealer,
    avatars,
    playerRefs,
    getSrcCard,
    rever,
    foldedPlayers,
    shouldShareCards,
    sharingCards,
    allInArr,
    isRevealFinished,
    gameOver,
    community,
    communityShow,
    communityToShow,
    communityReversNb,
    moveCommCards,
    playSound,
    soundMute
}) => {
    return (
        <div className="table-area" ref={tableRef}>
            {/* Visualisation de la table (tapis vert + LED) */}
         
                    <div className="tp-table-wrap">
                        <div className="tp-table-rail"></div>
                        <div className="tp-table-felt"></div>
                        <div className="center-game-area" style={{
                            position: 'absolute',
                            top: '25%',
                            left: '20%',
                            right: '20%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '10px',
                            zIndex: 16
                        }}>
                            
                            
                        </div>

                    
            </div>
            {/* Pied de la table */}
            <div className="table-base"></div>
        
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
    );
};

export default TableAreaView;
