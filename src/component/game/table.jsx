import React, { useState, useRef } from 'react';
import { Smile, ArrowBigLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CommunityCards from './CommunityCards';
import Pots from './Pots';
import Player from './Player';
import PlayerActions from './PlayerActions';
import SmileyModal from './SmileyModal';
import TableChat from './TableChat';
import './GameView.scss'; // Assurez-vous que ce fichier contient bien les styles souhaités


const BG_IMAGE = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wgARCAKaA+gDASIAAhEBAxEB/8QAGwAAAgMBAQEAAAAAAAAAAAAAAQIAAwQFBgf/xAAaAQADAQEBAQAAAAAAAAAAAAAAAQIDBAUG/9oADAMBAAIQAxAAAAH58yZ+bs1SqsW/GINGS60i2hCaRbFSExVWDbi2gXU20tT57MrtWPLKhkBg471qpk015bbnfVi2Rdop0y0lFrTh0l1DVU1UbQ1WYjGlVjVbqwRXI647AqWhCF4EW2J1SwNU8zr8jaT1eZ102RphSK4aauFhWKDlADxI1YqQLJUAuFWhOqXwKRdcnS9QC3PbWyxUYV9cyDumW65ZIGrnmaLuQhoQRqWRBmk1UqARtnbuw7crtVpjpXm2U3GS0DTO1KyD21VpPFSiyUxnRoqvzrJOhTU57K7WgwCuWvbFIzSKCrVSt5t9GsG2uxt4VlWWZ7Jq00a5ayxZYSxwwHfXSxtetJ7KdGbCXVKlc1ObbufYGhs0T0PnslppqgzBWK2F06gY1XNNQKLHHUSBQOo15HWy6zl7HO6Kay05Ol2UIrEKhYzKZeoILSimMWqpejEDMCrUaVxyQLEplxZajKmMk1ll63JWyyXi02QKktcKluKdDWUNNUFtACVNMYWPtw3w9j4rMqvraJ5qdaaZ5WK3Ni2Z0mW/SiqNJvMm6mkmnIBbs0vmsetim0Nc1M6zSA+qyazc/s8e0bqjbuuoOaeq2BSzFoQxFmjCU90qvyu+sNFFa1aYQ0lR63NThbV1YZNGEasQhAIjFsQMeCIuCialbrU2NSUEq4dG7DVjtu5urPUVl00mow1MWKywABChBoVBkNTLGW1EaqlGhGI0NOllVjBNmosRcpWaltNqGTQksrVRS05TfSyy5aVS2hpLJBtS6hnBGpZv5/RxdNe+mTO6SovlV01Vn2I1l1KtTdnrYFl8B7KFl203OPEdVFy9uRkaMzID7K789JQMzmJu6xXmNPoedNY1sW4UiNGV3ghZE3GhprFXcLhLMtlK2zO8u9k1Z3Qb5LrZ2l502RmWawjGdRaxrvUMU2wMTayGJdS0qLNMms8ugVO2iXj0aded8yrvebahtGudYYsqFsCmXhrO0vZnNsRUXgKSRqtoQksgJLVGkdRSLGNl0VUkWLcxJZSsfO0O021zVBcUkLqEIAMG0J4r+7jyvm5+nl0zq15A50592aaoeuaZ3qtacDW0qdTTOrpgjCbVFRbC2bKUQ9GsswjTXcDRUZKdCalezP0sPNuKLDpHPfo8zTONHYtxqmhS99SjVWJ1JclJaL5QxzaZK0topWQshC7J1S0opLliCyIrjhpS5TrLkKmYgguCdRZhILlHduydTn2x59nKqVDTbJYwAAqwyQFZY0QpAB4xQ4BZAwmMmsuidJsrBVuz0luS8UqZUyWUZsF0taraRB7swWirUipLVaD6NOdZJbpmqsfovPzbZbn1xqrJrPObWoqu0NnoFzkcanc1zpolwDU002i0qrMt4DPZfW1YKr5qo7PUw/EN2tTjB0PNdLHf0Hn9VOV5edsydvPophc55bXa2282/PTPZXNc9JmeKdValKNCsj5tKea0SptVxFUhKtI1iutGkUOFsriLDWRvK3SYqyGJeaSy/u51zau9mzrznrsLZ2mLqbGvKDqdrSPErso2mgFbmQqABFIQqBChjxIx4iBcagDvnsHfYl+embO19xdmuzS2tYjR1CHNN6VTU2Utuc1xShmqLGURWps3QzvvZ8C8fTOPqo7...";

const seatPositions = [
  { top: "-12.4%", left: "58.5%" },
  { top: "8%", left: "88.8%" },
  { top: "59.4%", left: "92.2%" },
  { top: "85%", left: "70.7%" },
  { top: "95%", left: "40%" },
  { top: "85%", left: "12.3%" },
  { top: "54.4%", left: "-8.2%" },
  { top: "7%", left: "-3.2%" },
  { top: "-12.4%", left: "31.5%" },
];

const SeatIcon = () => (
  <svg viewBox="0 0 24 24" style={{ width: "24px", height: "24px", fill: "var(--gold)" }}>
    <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.4 0-9 2.2-9 5v1h13.8A5.9 5.9 0 0 1 16 15c0-.7.1-1.4.3-2A15 15 0 0 0 12 14Zm7 0v3h-3v2h3v3h2v-3h3v-2h-3v-3Z" />
  </svg>
);

export default function TablePoker({ 
    tableState, 
    tableId, 
    betSize, 
    setBetSize, 
    emitPlayerAction, 
    addRange, 
    minusRange,
    socketRef,
    currentUserId
}) {
  const navigate = useNavigate();
  const quitter = () => navigate('/acceuil');
  const [isSmileyOpen, setIsSmileyOpen] = useState(false);
  // Nécessite l'accès au socket, je vais supposer que vous avez une référence au socket.
  // Si le socket n'est pas disponible directement, il faudra passer la prop socket ou utiliser un contexte.
  // Pour l'instant, je vais émettre l'événement via un socket global ou une prop si disponible.
  // Vous devrez peut-être ajouter une prop `socket` à TablePoker.

  const handleSmileySelect = (smiley) => {
    console.log("Emoji sélectionné:", smiley);
    // Exemple d'émission :
    // socket.emit('sendEmoji', { tableId, smiley });
    setIsSmileyOpen(false);
  };
  console.log("TablePoker rendering, tableState:", tableState);
  console.log("Condition for PlayerActions:", tableState.handInProgress, tableState.toAct, tableState.seat);
  const seats = tableState?.seats || Array(9).fill(null);
  const rever = tableState?.rever;
  
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

  const ref0 = useRef(null);
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);
  const ref5 = useRef(null);
  const ref6 = useRef(null);
  const ref7 = useRef(null);
  const ref8 = useRef(null);
  const playerRefs = [ref0, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8];
  const tableRef = useRef(null);
  
  const winData = tableState?.winData || {};
  const dealer = tableState?.dealer;
  const sb = tableState?.sb;
  const bb = tableState?.bb;
  const foldedPlayers = useRef(new Set());
  const shouldShareCards = false;
  const sharingCards = false;
  const allInArr = [];
  const isRevealFinished = tableState?.isRevealFinished || false;
  const gameOver = tableState?.gameOver || false;

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <SmileyModal 
        isOpen={isSmileyOpen} 
        onClose={() => setIsSmileyOpen(false)} 
        onSelect={handleSmileySelect}
      />
      <TableChat 
        socketRef={socketRef}
        tableId={tableId}
        tableState={tableState}
        currentUserId={currentUserId}
      />
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
          width:15%;
          background:
            repeating-linear-gradient(90deg, #3a1a1f 0 6px, #4a2228 6px 12px);
          box-shadow: inset 0 0 40px rgba(0,0,0,.6);
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
          top:40%;left:50%;
          transform:translate(-50%,-46%);
          width:70%;
          max-width:600px;
          aspect-ratio: 16/9;
        }
        
          
        .tp-table-rail{
          position:absolute;inset:0;
          border-radius:50%/48%;
          background: #5d4037; /* Bordure bois */
          box-shadow:
            0 18px 30px rgba(0,0,0,.55),
            inset 0 0 0 6px rgba(255,255,255,.2);
        }
        .tp-table-felt{
          position:absolute;
          inset:8%; /* Plus petit pour montrer le bois */
          border-radius:50%/48%;
          background: radial-gradient(ellipse at 50% 40%, #e00 0%, #a00 70%); /* Feutre rouge */
          box-shadow: inset 0 0 40px rgba(0,0,0,.6);
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
          z-index:14;
        }
        .tp-waiting{
          position:absolute;
          top:93%; left:50%;
          transform:translateX(-50%);
          width:100%;
          text-align:center;
          color:var(--gold);
          font-size:15px;
          letter-spacing:1.5px;
          text-transform:uppercase;
          font-weight:600;
          text-shadow:0 2px 6px rgba(0,0,0,.7);
          z-index:20;
        }
        @media (max-width: 768px) {
          .tp-waiting {
            top: 78vh;
          }
          .tp-table-wrap {
            position: absolute;
            top: 39%;
            left: 50%;
            transform: translate(-50%, -46%);
            width: 67%;
            max-width: 600px;
            aspect-ratio: 24 / 9;
          }
          .tp-left-rail {
            position: absolute;
            left: calc(-3px + env(safe-area-inset-left, 0px));
            bottom: calc(30px + env(safe-area-inset-bottom, 0px));
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            z-index: 20;
          }
        }
        .tp-left-rail{
          position:absolute;
          left:calc(14px + env(safe-area-inset-left, 0px));
          bottom:calc(16px + env(safe-area-inset-bottom, 0px));
          display:flex;flex-direction:column;
          align-items:center;
          gap:10px;
          z-index:20;
        }
        .tp-target-btn{
          width:38px;height:38px;border-radius:50%;
          background:radial-gradient(circle at 35% 30%,#6b3040,#3a1420 75%);
          border:2px solid var(--gold);
          display:flex;align-items:center;justify-content:center;
          color:var(--gold);
        }
        .tp-profile{
          display:flex;flex-direction:column;align-items:center;
          gap:4px;
        }
        .tp-profile .tp-pic{
          width:52px;height:52px;border-radius:50%;
          background:
            radial-gradient(circle at 35% 30%, #e7b7c9, #7a3a54 75%);
          border:2px solid var(--gold);
          box-shadow:0 3px 10px rgba(0,0,0,.5);
        }
        .tp-join-btn{
          background:linear-gradient(180deg,#ffe27a,#c8890f);
          color:#3a2400;
          font-weight:700;
          font-size:10px;
          letter-spacing:.5px;
          padding:4px 12px;
          border-radius:12px;
          border:1px solid #fff3cf;
        }
        .tp-menu-row{
          display:flex;gap:10px;
        }
        /* Rideaux */
        .curtain {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 15%;
          background: linear-gradient(to right, #8b0000, #4a0000);
          z-index: 25;
          box-shadow: 0 0 20px rgba(0,0,0,0.8);
        }
        .curtain.left { left: 0; border-right: 5px solid #2e0000; }
        .curtain.right { right: 0; border-left: 5px solid #2e0000; }
        .card-community {
            width: 60px !important;
            height: 90px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            visibility: visible !important;
            opacity: 1 !important;
        }
        .card-community img {
            width: 100% !important;
            height: 100% !important;
            object-fit: contain !important;
        }
        .turn-countdown-container {
            width: 100px;
            height: 6px;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 3px;
            margin-top: 5px;
            overflow: hidden;
        }
        .turn-countdown-bar {
            height: 100%;
            background: #00FF99;
            width: 100%;
            animation: countdown linear forwards;
        }
        @keyframes countdown { from { width: 100%; } to { width: 0%; } }

        .action-badge {
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.7rem;
            font-weight: bold;
            color: white;
            text-transform: uppercase;
        }
        .badge-fold { background-color: #ff4d4d; }
        .badge-call { background-color: #ffa500; }
        .badge-raise { background-color: #00FF99; color: #000; }
        .btn-fold, .btn-call, .btn-raise, .btn-allin {
            padding: 10px 20px;
            border-radius: 50px;
            font-weight: bold;
            font-size: 14px;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
            color: white;
            text-align: center;
        }
        .btn-fold { background: linear-gradient(180deg, #f87171, #ef4444); box-shadow: 0 4px 0 #dc2626; }
        .btn-call { background: linear-gradient(180deg, #fbbf24, #f59e0b); color: black; box-shadow: 0 4px 0 #d97706; }
        .btn-raise { background: linear-gradient(180deg, #333, #000); box-shadow: 0 4px 0 #000; }
        .btn-allin { background: linear-gradient(180deg, #fbbf24, #f59e0b); color: black; box-shadow: 0 4px 0 #d97706; }
        .btn-fold:active, .btn-call:active, .btn-raise:active, .btn-allin:active { transform: translateY(2px); box-shadow: none; }
        .card-container-0 { transform: translateY(48px) rotate(0deg) !important; }
        .card-container-1 { transform: translateY(-10px) !important; }
        .card-container-2 { transform: translateY(50px) translateX(105px) rotate(-15deg) !important; }
        .card-container-3 { transform: translateY(-55px) translateX(90px) rotate(0deg)!important; }
        .card-container-4 { transform: translateY(190px) !important; }
        .card-container-5 { transform: translateY(190px) !important; }
        .card-container-6 { transform: translateY(210px) !important; }
        .card-container-7 { transform: translateY(75px) translateX(-150px) rotate(0deg)!important; }
        .card-container-8 { transform: translateY(10px) translateX(-3px) rotate(-15deg)!important; }
      `}</style>
      <div className="tp-root">
        {/* Rideaux décoratifs */}
        <div className="curtain left"></div>
        <div className="curtain right"></div>
        {/* Overlay pour forcer le mode paysage */}
        <div className="rotate-device-overlay">
            <div className="rotate-message">
                Veuillez tourner votre appareil<br/>en mode paysage pour jouer
            </div>
        </div>

        <div className="tp-stage" ref={tableRef}>
          <div className="tp-pillar left"></div>
          <div className="tp-pillar right"></div>
          <div className="tp-topbar">
            <div className="tp-icon-btn">
            
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
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 48, 48, 0.4)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 48, 48, 0.2)'}
                >
                    <ArrowBigLeft size={24} />
                    Quitter
                </div>
            )}

            </div>
            
                  {/* Branding */}
                  <div className="table-branding" >
                      <img src="/caf.png" alt="Logo"  className="table-logo"  width='10%'/>
                      <h1 className="table-name">Afripoks</h1>
                  </div>
            
                  <div className="tp-top-right">
                    <div className="tp-icon-btn">🐷</div>
                    <div className="tp-chip-btn">$</div>
                  </div>
          </div>
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
                {console.log("DEBUG communityCardsS final:", tableState?.communityCards)}
                <CommunityCards
                    key={tableId}
                    community={tableState?.communityCards || []}
                    communityShow={tableState?.communityShow}
                    communityToShow={tableState?.communityToShow}
                    communityReversNb={tableState?.communityReversNb}
                    moveCommCards={tableState?.moveCommCards}
                    gameOver={gameOver}
                    allInArr={allInArr}
                    winData={winData}
                    getSrcCard={getSrcCard}
                    playSound={console.log}
                    soundMute={false}
                    isRevealFinished={isRevealFinished}
                    tableId={tableId}
                />
                <Pots tableState={tableState} />
            </div>

            {seatPositions.map((pos, index) => (
              <div
                key={index}
                className="tp-seat"
                style={{ top: pos.top, left: pos.left }}
              >
                {seats[index] ? (
                  <Player 
                    i={index}
                    chips={seats[index].stack}
                    tableState={tableState}
                    winData={winData}
                    foldedPlayers={foldedPlayers}
                    shouldShareCards={shouldShareCards}
                    sharingCards={sharingCards}
                    allInArr={allInArr}
                    isRevealFinished={isRevealFinished}
                    gameOver={gameOver}
                    playerRefs={playerRefs}
                    tableRef={tableRef}
                    getSrcCard={getSrcCard}
                    tableId={tableId}
                    rever={rever}
                    dealer={dealer}
                    sb={sb}
                    bb={bb}
                  />
                ) : (
                  <div className={`tp-seat-icon ${tableState.activeSeats?.includes(index) ? 'active' : ''}`}>
                    <SeatIcon />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="tp-waiting">
            {tableState.handInProgress && tableState.toAct !== null && tableState.toAct === tableState.seat ? (
              <PlayerActions
                  tableState={tableState}
                  betSize={betSize}
                  setBetSize={setBetSize}
                  emitPlayerAction={emitPlayerAction}
                  addRange={addRange}
                  minusRange={minusRange}
              />
            ) : (
              "En attente..."
            )}
          </div>
          
          <div className="tp-left-rail">
            <div className="tp-target-btn">🎯</div>
            <div className="tp-profile">
              <div className="tp-pic"></div>
              <div className="tp-join-btn">REJOINDRE</div>
            </div>
            <div className="tp-menu-row">
              <div className="tp-icon-btn">☰</div>
              <div className="tp-icon-btn" onClick={() => setIsSmileyOpen(true)} style={{ cursor: 'pointer' }}>
                <Smile size={20} color="#e8c27a" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <TableChat 
        socketRef={socketRef}
        tableId={tableId}
        tableState={tableState}
        currentUserId={currentUserId}
        playerNames={tableState.playerNames || []}
      />
    </div>
      
  );
}
