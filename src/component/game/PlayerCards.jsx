import React from 'react';

const PlayerCards = ({ 
    winData, 
    foldedPlayers, 
    tableState, 
    i, 
    cardCount, 
    shouldShareCards, 
    sharingCards, 
    posCoords, 
    getSrcCard, 
    rever 
}) => {
    return (
        <div className={`player-cards ${cardCount > 2 ? 'omaha' : ''}`}>
            {(winData?.allCards ?? []).length > 0 ? (
                <div className={`card-containers card-container-${i} ${cardCount > 2 ? 'omaha' : ''}`} style={{ marginTop: '1.2em' }}>
                    {(winData.allCards[i] ?? []).length > 0 && !foldedPlayers.current.has(i) && (
                        <>
                            {(winData.allCards[i]).map((card, idx) => (
                                <div className="card" key={idx}>
                                    <img src={getSrcCard(card)} alt="" />
                                </div>
                            ))}
                        </>
                    )}
                </div>
            ) : (
                <>
                    {tableState.activeSeats.includes(i) && tableState.seats[i] !== null && (
                        i === tableState.seat && tableState.playerCards != null ? (
                            <div className={`card-containers card-container-${i} ${cardCount > 2 ? 'omaha' : ''}`}
                                style={{
                                    transform: 'translateY(0%)',
                                    zIndex: -1,
                                }}
                            >
                                {tableState.playerCards.map((card, idx) => (
                                    card ? (
                                        <div className="card" key={idx}>
                                            <img src={getSrcCard(card)} alt="" />
                                        </div>
                                    ) : null
                                ))}
                            </div>
                        ) : (
                            <div
                                className={`card-containers card-container-${i} ${cardCount > 2 ? 'omaha' : ''}`}
                                style={{
                                    transform: 'translateY(30%)',
                                    zIndex: -1,
                                }}
                            >
                                {[...Array(cardCount)].map((_, idx) => (
                                    <div className="card" key={idx}><img src={rever} alt="" /></div>
                                ))}
                            </div>
                        )
                    )}

                    {shouldShareCards && tableState.seats[i] !== null && (
                        <div
                            className={`card-containers card-container-${i} ${cardCount > 2 ? 'omaha' : ''}`}
                            style={{
                                transform: 'translateY(50%)',
                                zIndex: -1,
                            }}
                        >
                            {[...Array(cardCount)].map((_, idx, arr) => {
                                const count = arr.length;
                                const xOffset = (idx - (count - 1) / 2) * -100;
                                const dx = sharingCards ? 0 : (posCoords.tx - posCoords.px) / posCoords.zoom;
                                const dy = sharingCards ? 0 : (posCoords.ty - posCoords.py) / posCoords.zoom;
                                const finalX = sharingCards ? 0 : dx + (xOffset / 100) * 30;
                                const delay = (idx * 0.2) + (i * 0.08);

                                return (
                                    <div
                                        key={idx}
                                        className="card"
                                        style={{
                                            transition: 'all 0.8s ease-out',
                                            transitionDelay: `${delay}s`,
                                            transform: `translate3d(${finalX}px, ${dy}px, 0) scale(${sharingCards ? 1 : 0.2}) rotate(${sharingCards ? 0 : 180}deg)`,
                                            opacity: shouldShareCards ? 1 : 0,
                                        }}
                                    >
                                        <img src={rever} alt="" />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PlayerCards;
