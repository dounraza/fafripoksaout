import React, { useEffect, useState, useRef } from 'react';
import SmileyModal from './SmileyModal';
import { smileySocket } from '../../engine/socket';
import { getFullAvatarUrl } from '../../services/api';
import useUserAvatar from '../../hooks/useUserAvatar';
import PlayerCards from './PlayerCards';
import PlayerDetails from './PlayerDetails';

const Player = ({
    i,
    chips,
    tableState,
    winData,
    sb,
    bb,
    dealer,
    avatars,
    playerRefs,
    tableRef,
    getSrcCard,
    rever,
    foldedPlayers,
    shouldShareCards,
    sharingCards,
    allInArr,
    gameOver,
    isRevealFinished,
    tableId,
}) => {
    const [smileysOpen, setSmileysOpen] = useState(false);
    const [smiley, setSmiley] = useState(null);
    const [playerSmileys, setPlayerSmileys] = useState([]);

    const sendSmiley = (smiley) => {
        smileySocket.emit('send-smiley', { tableId, seat: tableState.seat, smiley });
    };

    const onReceiveSmiley = (seat, smiley) => {
        setPlayerSmileys(prev => [...prev, { seat, smiley }]);
        setTimeout(() => setPlayerSmileys(prev => prev.filter(s => s.seat !== seat)), 5000);
    };

    useEffect(() => {
        smileySocket.emit('join', tableId);
        smileySocket.on('receive-smiley', onReceiveSmiley);
        return () => smileySocket.off('receive-smiley', onReceiveSmiley);
    }, [tableId]);

    useEffect(() => {
        console.log(`DEBUG [Player i=${i}] Received chips:`, chips);
    }, [chips, i]);

    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        if (!gameOver) {
            setShowResult(false);
        } else {
            setShowResult(true);
            const timeout = setTimeout(() => {
                setShowResult(false);
            }, 5000);
            return () => clearTimeout(timeout);
        }
    }, [gameOver]);

    const [posCoords, setPosCoords] = useState({ tx: 0, ty: 0, px: 0, py: 0, zoom: 1 });
    useEffect(() => {
        if (shouldShareCards && playerRefs[i]?.current && tableRef.current) {
            const playerRect = playerRefs[i].current.getBoundingClientRect();
            const tableRect = tableRef.current.getBoundingClientRect();
            setPosCoords({
                tx: tableRect.left + tableRect.width / 2,
                ty: tableRect.top + tableRect.height / 2,
                px: playerRect.left + playerRect.width / 2,
                py: playerRect.top + playerRect.height / 2,
                zoom: 1
            });
        }
    }, [shouldShareCards, i, playerRefs, tableRef]);

    const getCardCount = () => {
        if (tableState.playerCards?.length > 0) return tableState.playerCards.length;
        if (winData?.allCards) {
            const firstHand = winData.allCards.find(hand => hand && hand.length > 0);
            if (firstHand) return firstHand.length;
        }
        return 2;
    };

    const cardCount = getCardCount();

    return (
        <>
            <div
                ref={playerRefs[i]}
                className={`player seat${i} ${(winData?.winStates ?? []).length > 0 && winData.winStates.find(w => w.seat === i)?.isWinner && isRevealFinished ? 'win' : ''} ${tableState.toAct === i ? 'active' : ''} ${(winData?.winStates ?? []).length > 0 && winData.winStates.find(w => w.seat === i)?.isWinner === false && isRevealFinished ? 'lost' : ''}`}
                style={{ borderRadius: 12 }}
                key={i}
            >
                <PlayerCards 
                    winData={winData} 
                    foldedPlayers={foldedPlayers} 
                    tableState={tableState} 
                    i={i} 
                    cardCount={cardCount} 
                    shouldShareCards={shouldShareCards} 
                    sharingCards={sharingCards} 
                    posCoords={posCoords} 
                    getSrcCard={getSrcCard} 
                    rever={rever} 
                />
                
                <PlayerDetails
                    i={i}
                    tableState={tableState}
                    winData={winData}
                    dealer={dealer}
                    sb={sb}
                    bb={bb}
                    foldedPlayers={foldedPlayers}
                    chips={chips}
                    showResult={showResult}
                    isRevealFinished={isRevealFinished}
                    tableId={tableId}
                    setSmileysOpen={setSmileysOpen}
                    smiley={smiley}
                    playerSmileys={playerSmileys}
                    sendSmiley={sendSmiley}
                    tableStateSeat={tableState.seat}
                />
            </div>
            {tableState.seat === i && (
                <SmileyModal 
                    isOpen={smileysOpen} 
                    onClose={() => setSmileysOpen(false)} 
                    onSelect={(smiley) => {
                        setSmileysOpen(false);
                        sendSmiley(smiley);
                    }}
                />
            )}
        </>
    );
};

export default Player;
