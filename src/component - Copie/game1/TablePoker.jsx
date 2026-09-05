import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { toast, ToastContainer } from "react-toastify";
import {useNavigate} from 'react-router-dom';
import { ArrowBigLeft, History, Smile } from 'lucide-react';
import { getLastHistory } from '../../services/tableServices';

import "./Game.scss";
// import rever from "../../styles/image/rever.png";
import tableTexture from "../../styles/image/vert_table.png";

import GameHistoryModal from './GameHistoryModal';
import RecaveModal from './RecaveModal';
import { onlineUsersSocket } from '../../engine/socket';

import TableTabs from './TableTabs';
import TableChat from './TableChat';
import GameView from './GameView';
import Chair from './Chair';
import PlayerInfo from './PlayerInfo';
import Player from './Player';
import CommunityCards from './CommunityCards';
import Pots from './Pots';
import SoundButton from './SoundButton';

const BG_IMAGE = tableTexture;

const TablePoker = ({tableId, tableSessionIdShared, setTableSessionId, cavePlayer }) => {
    const rever = "/rever.png";
    const [tableState, setTableState] = useState({});
    const [betSize, setBetSize] = useState(0);
    const [showRecaveModal, setShowRecaveModal] = useState(false);
    const [hasRecaved, setHasRecaved] = useState(false);
    const [winData, setWinData] = useState({});
    const [sb, setSb] = useState(-1);
    const [bb, setBb] = useState(-1);
    const [dealer, setDealer] = useState(-1);
    const [game, setGame] = useState(false);
    const socketRef = useRef(null);
    const navigate = useNavigate();
    const playerCave = cavePlayer;
    const [community, setCommunity] = useState([]);
    const [communityShow, setCommunityShow] = useState([]);
    const [isRevealFinished, setIsRevealFinished] = useState(false);
    const foldedPlayers = useRef(new Set());
    const isPossibleAction = useRef(true);
    const [soundMute, setSoundMute] = useState(false);
    const [avatars, setAvatars] = useState([]);
    const tableRef = useRef(null);
    const playerRefs = [
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
    ];
    const [shouldShareCards, setShouldShareCards] = useState(false);
    const [sharingCards, setSharingCards] = useState(false);
    const [communityReversNb, setCommunityReversNb] = useState(0);
    let latestCommCard = null;
    const [moveCommCards, setMoveCommCards] = useState(false);
    const [communityToShow, setCommunityToShow] = useState([]);
    const [allInArr, setAllInArr] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const potRef = useRef(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
    const [lastMatchHistory, setLastMatchHistory] = useState(null)

    useEffect(() => {
        const userId = sessionStorage.getItem('userId');
        if(!tableId) return;

        socketRef.current = io(process.env.REACT_APP_BASE_URL, {
            auth: {
                token: sessionStorage.getItem("accessToken"),
            },
        });

        socketRef.current.on('connect', () => {
            if(!tableSessionIdShared) {
                socketRef.current.emit('joinAnyTable', { tableId, userId, playerCave });

                onlineUsersSocket.emit('joined-tables:join', { uid: parseInt(userId), tid: parseInt(tableId) });
            }else {           
                socketRef.current.emit('joinTableSession',{ tableId, tableSessionId: tableSessionIdShared, userId, playerCave });
            }
        });

        socketRef.current.on('needRecave', (data) => {
            toast.info(data.message);
            setShowRecaveModal(true);
        });

        socketRef.current.on('playerActionError', (data) => {
            toast.error(data.message || "Une erreur est survenue.");
        });


        socketRef.current.on('joinError', (data) => {
            toast.error(data.message);
            onlineUsersSocket.emit('joined-tables:leave', { uid: userId, tid: tableId });
        });

        socketRef.current.on('win', (data) => {
            setGameOver(true);
            setGame(false);
            setCommunity(data.communityCards);
            setShouldShareCards(false);
            setWinData(data);
            
            const foldedPlayersArray = Array.from(foldedPlayers.current);
            
            setLastMatchHistory({
                communityCards: data.communityCards || [],
                allCards: data.allCards || [],
                playerNames: [],
                foldedPlayers: foldedPlayersArray
            });
        });

        async function shareCardsHandler() {
            setGameOver(false);
            setWinData({});
            setCommunity([]);
            setCommunityShow([]);
            setCommunityToShow([]);
            setAllInArr([]);
            
            setShouldShareCards(true);
            setTimeout(async () => {
                setSharingCards(true);
            }, 300);
        }
        socketRef.current.on('shareCards', shareCardsHandler);

        socketRef.current.on('start', () => {
            setWinData({});
            setGame(true);
            setCommunity([]);
            setCommunityShow([]);
            setAllInArr([]);
            foldedPlayers.current = new Set();
            setHasRecaved(false);

            setShouldShareCards(false);
            setSharingCards(false);
        });

        socketRef.current.on('tableState', (data) => {
            const minBet = data?.legalActions?.chipRange?.min ?? 0;
            setBetSize(minBet);
            setTableState(data);
            if(setTableSessionId) setTableSessionId(data.tableId);
            
            if (!data.handInProgress && data.seats && data.seats[data.seat] && data.seats[data.seat].stack === 0 && !hasRecaved) {
                setShowRecaveModal(true);
            }

            setAvatars(data.avatars);

            if(data.communityCards.length > 0) {
                if (latestCommCard !== data.communityCards[data.communityCards.length -1]) {
                    if (data.communityCards.length === 3) {
                        setCommunityReversNb(3);
                    } else {
                        setCommunityReversNb(1);
                    }
                    setTimeout(() => {
                        setMoveCommCards(true);
                    }, 100);
                }
                setTimeout(() => {
                    setMoveCommCards(false);
                    setCommunity(data.communityCards);
                    setCommunityReversNb(0);
                    latestCommCard = data.communityCards[data.communityCards.length -1];
                }, 500);
            }

            if(data.toAct === data.seat) {
                isPossibleAction.current=true;
            }

            for(const item of (data?.actions ?? [])) {
                if(item.action === 'fold') {
                    foldedPlayers.current.add(item.playerId)
                }
            }
            
            const lastAction = data?.actions[data?.actions.length - 1];
            
            if (lastAction) {
                const playerId = lastAction?.playerId;
                const seatInfo = data?.seats[playerId];
                
                if (lastAction.action === 'raise' && seatInfo.stack === 0) {
                  setAllInArr(prev => [...prev, seatInfo]);
                  return;
                }
            }
        });

        socketRef.current.on('quitsuccess', () => {
            onlineUsersSocket.emit('joined-tables:leave', { uid: parseInt(userId), tid: parseInt(tableId) });
            window.location.href = '/acceuil';
        });

        socketRef.current.on('quiterror', () => {
            quitter();
        });

        return () => {
            socketRef.current?.disconnect();
            socketRef.current = null;
        };
    }, [tableId, playerCave, tableSessionIdShared, hasRecaved, setTableSessionId]);

    const emitPlayerAction = (action, betSizeParam = undefined) => {
        const userId = sessionStorage.getItem('userId');
        if (!isPossibleAction.current) return;

        isPossibleAction.current = false;

        const betSizeSend = betSizeParam ? betSizeParam : betSize;
        const { min, max } = tableState.legalActions.chipRange;
        const clampedBet = Math.max(min, Math.min(betSizeSend, max));
        
        socketRef.current.emit('playerAction', {
            tableId: tableId,
            tableSessionId: tableState.tableId, 
            playerSeats: tableState.seat, 
            action: action, 
            bet: clampedBet
        });
    }

    const quitter = (force = false) => {
        socketRef.current.emit("quit", {
            tableId: tableId,
            tableSessionId: tableState.tableId,
            playerSeats: tableState.seat,
            force: force
        });
        const userId = sessionStorage.getItem('userId');
        onlineUsersSocket.emit('joined-tables:leave', { uid: parseInt(userId), tid: parseInt(tableId) });
        window.dispatchEvent(new Event('tableLeft'));
    };

    const handleRecave = (amount) => {
        if (hasRecaved) return; 
        setHasRecaved(true);
        setShowRecaveModal(false);
        socketRef.current.emit('recave', { tableId, amount });
    };

    const handleRecaveTimeout = () => {
        const userId = sessionStorage.getItem('userId');
        socketRef.current.emit('leave_table', { tableId, userId });
        setShowRecaveModal(false);
        navigate('/acceuil');
    };

    const getSrcCard = (card_id) => {
        if (!card_id) return '';
        const final_id_card = card_id.replace('T', 0).toUpperCase();
        try {
            return require(`../../image/card2/${final_id_card}.svg`);
        } catch (e) {
            console.error("Card not found", final_id_card);
            return '';
        }
    };

    const addRange = () => {
        setBetSize(Math.min((betSize + 10 ), tableState.legalActions.chipRange.max));
    }

    const minusRange = () => {
        setBetSize(Math.max((betSize - 1 ), tableState.legalActions.chipRange.min));
    }

    return (
        <div className="tp-root">
            <style>{`
                :root{
                --gold:#e8c27a;
                --gold-dark:#a9782f;
                --wine:#4a0e12;
                --wine-dark:#2b0709;
                --felt:#7a0f16;
                --felt-dark:#5c0a10;
                --panel:#2a1418;
                }
                .tp-root *{box-sizing:border-box;margin:0;padding:0;}
                .tp-root{
                width:100%;
                height:100vh;
                height:100dvh;
                font-family:'Segoe UI', Arial, sans-serif;
                background:#000;
                overflow:hidden;
                }
                .tp-stage{
                position:relative;
                width:100%;
                height:100%;
                min-height:400px;
                background:
                    radial-gradient(ellipse at 50% 0%, rgba(255,180,90,0.10), transparent 60%),
                    linear-gradient(180deg, rgba(10,5,5,.55) 0%, rgba(10,5,5,.35) 40%, rgba(10,5,5,.65) 100%),
                    url(${BG_IMAGE});
                background-size: cover;
                background-position: center;
                overflow:hidden;
                }
                .tp-pillar{
                position:absolute;
                top:0;bottom:0;
                width:11%;
                background:
                    repeating-linear-gradient(90deg, #3a1a1f 0 6px, #4a2228 6px 12px);
                box-shadow: inset 0 0 40px rgba(0,0,0,.6);
                z-index:10;
                }
                .tp-pillar.left{left:0;}
                .tp-pillar.right{right:0;}
                .tp-pillar::before,.tp-pillar::after{
                content:"";
                position:absolute;left:0;right:0;height:5%;
                background:linear-gradient(180deg,#c9a34e,#7c5a20);
                }
                .tp-pillar::before{top:0;}
                .tp-pillar::after{bottom:0;}
                .tp-topbar{
                position:absolute;
                top:calc(14px + env(safe-area-inset-top, 0px));
                left:calc(14px + env(safe-area-inset-left, 0px));
                right:calc(14px + env(safe-area-inset-right, 0px));
                display:flex;
                justify-content:space-between;
                align-items:flex-start;
                z-index:20;
                }
                .tp-icon-btn{
                width:42px;height:42px;border-radius:50%;
                background:radial-gradient(circle at 35% 30%, #6b3040, #3a1420 70%);
                border:2px solid var(--gold);
                display:flex;align-items:center;justify-content:center;
                color:var(--gold);
                font-size:18px;
                box-shadow:0 2px 6px rgba(0,0,0,.5);
                }
                .tp-top-right{display:flex;gap:10px;}
                .tp-chip-btn{
                width:44px;height:44px;border-radius:50%;
                background:radial-gradient(circle at 35% 30%,#ffd76a,#c8890f 75%);
                border:2px solid #fff3cf;
                display:flex;align-items:center;justify-content:center;
                font-size:18px;
                box-shadow:0 2px 8px rgba(0,0,0,.5);
                }
                .tp-table-wrap{
                position:absolute;
                top:50%;left:50%;
                transform:translate(-50%,-46%);
                width:70%;
                max-width:600px;
                aspect-ratio: 16/9;
                }
                .tp-table-rail{
                position:absolute;inset:0;
                border-radius:50%/48%;
                background:
                    linear-gradient(180deg, var(--gold) 0%, var(--gold-dark) 45%, #6b4a1c 100%);
                box-shadow:
                    0 18px 30px rgba(0,0,0,.55),
                    inset 0 0 0 6px rgba(255,235,190,.4);
                }
                .tp-table-felt{
                position:absolute;
                inset:6.5%;
                border-radius:50%/48%;
                background:
                    radial-gradient(ellipse at 50% 40%, var(--felt) 0%, var(--felt-dark) 70%, #430a0e 100%);
                box-shadow: inset 0 0 40px rgba(0,0,0,.6), inset 0 0 0 3px rgba(255,215,150,.35);
                }
                .tp-table-felt::before{
                content:"";
                position:absolute;
                inset:14%;
                border-radius:50%/48%;
                border:1px solid rgba(255,215,150,.18);
                }
                .tp-seat{
                position:absolute;
                width:52px;height:52px;
                border-radius:50%;
                background:radial-gradient(circle at 35% 30%, #4a2530, #24101a 75%);
                border:2px solid var(--gold);
                display:flex;align-items:center;justify-content:center;
                color:var(--gold);
                box-shadow:0 3px 10px rgba(0,0,0,.55);
                }
                .tp-gift{
                position:absolute;
                top:58%; left:50%;
                transform:translate(-50%,-50%);
                width:34px;height:34px;
                }
            `}</style>
            
            <div className="tp-stage" key={tableId}>
                <RecaveModal 
                    isOpen={showRecaveModal} 
                    onClose={() => setShowRecaveModal(false)} 
                    onRecave={handleRecave} 
                    onTimeout={handleRecaveTimeout}
                    minCave={100}
                    defaultCave={500}
                    timer={10}
                />
                
                <ToastContainer />
            
                <GameView
                    tableState={tableState}
                    tableId={tableId}
                    game={game}
                    gameOver={gameOver}
                    winData={winData}
                    playSound={() => {}}
                    isRevealFinished={isRevealFinished}
                    playerRefs={playerRefs}
                    potRef={potRef}
                    betSize={betSize}
                    setBetSize={setBetSize}
                    emitPlayerAction={emitPlayerAction}
                    addRange={addRange}
                    minusRange={minusRange}
                    shouldShareCards={shouldShareCards}
                    getSrcCard={getSrcCard}
                    rever={rever}
                />

                <div className="table-area" ref={tableRef}>
                    {/* Visualisation de la table (tapis vert + LED) */}
                    <div className="table-visual"></div>
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
                        {tableState.seats && tableState.seats.map((seatData, i) => (
                            <PlayerInfo key={i} i={i}>
                                <Player
                                    i={i}
                                    chips={seatData}
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
                            playSound={() => {}}
                            soundMute={soundMute}
                            isRevealFinished={isRevealFinished}
                            tableId={tableId}
                        />
                    </div>
                </div>

                {!tableState.handInProgress && (
                    <div 
                        className="menu-button" 
                        onClick={() => quitter()}
                        style={{
                            position: 'absolute',
                            top: '2%',
                            left: '2%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            borderRadius: '25px',
                            cursor: 'pointer',
                            background: 'rgba(255, 48, 48, 0.2)',
                            color: '#FFF',
                            backdropFilter: 'blur(5px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            transition: 'all 0.3s ease',
                            zIndex: 999,
                        }}
                    >
                        <ArrowBigLeft size={24} />
                        Quitter
                    </div>
                )}

                <div
                    style={{
                        position: 'absolute',
                        top: '2%',
                        right: '2%',
                        display: 'flex',
                        gap: '15px',
                        zIndex: 999,
                        background: 'rgba(0, 0, 0, 0.3)',
                        padding: '5px 15px',
                        borderRadius: '25px',
                        backdropFilter: 'blur(5px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <TableTabs />
                    </div>

                    <SoundButton soundMute={soundMute} setSoundMute={setSoundMute} />
                    
                    <div 
                        className="menu-button"
                        onClick={() => setIsHistoryModalOpen(true)}
                        style={{
                            color: '#FFD700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '8px',
                            borderRadius: '50%',
                            transition: 'all 0.3s ease',
                            background: 'rgba(255, 255, 255, 0.05)',
                        }}
                    >
                        <History size={24} />
                    </div>
                </div>
                <GameHistoryModal 
                    isOpen={isHistoryModalOpen}
                    onClose={() => setIsHistoryModalOpen(false)}
                    lastMatchData={lastMatchHistory}
                    getSrcCard={getSrcCard}
                    playerNames={tableState.playerNames || []}
                />
                    <TableChat 
                        socketRef={socketRef}
                        tableId={tableId}
                        tableState={tableState}
                        currentUserId={sessionStorage.getItem('userId')}
                        playerNames={tableState.playerNames || []}
                    />
            </div>
        </div>
    );
};

export default TablePoker;