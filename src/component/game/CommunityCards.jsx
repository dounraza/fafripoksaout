import React from 'react';

const CommunityCards = ({
    community, communityShow, communityToShow, communityReversNb, moveCommCards,
    gameOver, allInArr, winData, getSrcCard, playSound, soundMute, isRevealFinished, tableId
}) => {
    return (
        <div className="community-cards" key={tableId}>
            {(community.length > 0) && (
                <>
                    {/* Reverse Cards Layer (The 'Back' of cards before they are revealed) */}
                    <div
                        style={{
                            position: 'absolute',
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        {Array.from({ length: 5 }).map((_, i) => {
                            let translateX = 0;
                            if (i === 0) translateX = 200;
                            if (i === 1) translateX = 100;
                            if (i === 2) translateX = 0;
                            if (i === 3) translateX = -100;
                            if (i === 4) translateX = -200;

                            // A card back is visible if:
                            // 1. It's part of a reverse animation (communityReversNb)
                            // 2. OR it hasn't been fully revealed yet (not in communityToShow)
                            const isVisible = (communityReversNb === 3 && i < 3) || 
                                              (communityReversNb === 1 && i === community.length - 1) ||
                                              (community.length > i && !communityToShow.includes(community[i]));

                            return (
                                <div key={i}
                                    style={{
                                        opacity: isVisible ? 1 : 0,
                                        transition: 'transform 0.25s ease-in, opacity 0.25s ease-in',
                                        transform: moveCommCards ? 'translate(0, 0) rotateY(0deg)' : `translate(${translateX}%, -200%) rotateY(90deg)`,
                                        padding: 4,
                                        pointerEvents: 'none'
                                    }}
                                    onTransitionStart={() => {
                                        if (moveCommCards) {
                                            playSound('showCard', soundMute);
                                        }
                                    }}
                                >
                                    <img src={require("../../styles/image/rever.png")} alt="" />
                                </div>
                            )
                        })}
                    </div>

                    {/* Revealed Cards Layer */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {community.map((card, i) => {
                            const isRevealed = communityToShow.includes(card);
                            return (
                                <div className="card-community" key={i}
                                    style={{
                                        transition: 'all .8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        transform: isRevealed ? 'translateX(0) rotateY(0deg)' : 'translateX(-50px) rotateY(90deg)',
                                        opacity: isRevealed ? 1 : 0,
                                        margin: '0 4px'
                                    }}
                                >
                                    <img src={getSrcCard(card)} alt="" />
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
            
            {(gameOver && community.length === 0) && (
                <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem', textAlign: 'center', width: '100%' }}>
                    All Fold
                </div>
            )}
        </div>
    );

}

export default React.memo(CommunityCards);