import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { Crown, Dice5, DoorOpen, Edit3, Gem, Info, Menu, Users } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import { createLudoEngine } from "./ludoEngine";
import TableChat from "./TableChat";
import dice1 from "./ludoDice/1.png";
import dice2 from "./ludoDice/2.png";
import dice3 from "./ludoDice/3.png";
import dice4 from "./ludoDice/4.png";
import dice5 from "./ludoDice/5.png";
import dice6 from "./ludoDice/6.png";

import "./LudoGame.scss";

const diceImages = { 1: dice1, 2: dice2, 3: dice3, 4: dice4, 5: dice5, 6: dice6 };
const DICE_ANIMATION_DURATION = 1100;

const bases = {
  green: { tokenPrefix: "g", holderPrefix: "g_g", className: "g_green" },
  yellow: { tokenPrefix: "y", holderPrefix: "g_y", className: "g_yellow" },
  red: { tokenPrefix: "r", holderPrefix: "g_r", className: "g_red" },
  blue: { tokenPrefix: "b", holderPrefix: "g_b", className: "g_blue" },
};

// ... (MoveGrid definitions remain the same)
const yellowMove = [["24"], ["25"], ["26"], ["23"], ["yf26", "box-y"], ["27", "box-y"], ["22", "box-y"], ["yf27", "box-y"], ["28"], ["21"], ["yf28", "box-y"], ["29"], ["20"], ["yf29", "box-y"], ["30"], ["19"], ["yf30", "box-y"], ["31"]];
const greenMove = [["13"], ["14", "box-g"], ["15"], ["16"], ["17"], ["18"], ["12"], ["gf13", "box-g"], ["gf14", "box-g"], ["gf15", "box-g"], ["gf16", "box-g"], ["gf17", "box-g"], ["11"], ["10"], ["9", "box-g"], ["8"], ["7"], ["6"]];
const blueMove = [["32"], ["33"], ["34"], ["35", "box-b"], ["36"], ["37"], ["bf43", "box-b"], ["bf42", "box-b"], ["bf41", "box-b"], ["bf40", "box-b"], ["bf39", "box-b"], ["38"], ["44"], ["43"], ["42"], ["41"], ["40", "box-b"], ["39"]];
const redMove = [["5"], ["rf56", "box-r"], ["45"], ["4"], ["rf55", "box-r"], ["46"], ["3"], ["rf54", "box-r"], ["47"], ["2"], ["rf53", "box-r"], ["48", "box-r"], ["1", "box-r"], ["rf52", "box-r"], ["49"], ["52"], ["51"], ["50"]];

function Base({ color, onChoose, onRoll, playerInfo, isMyTurn, myColor, diceAnimating }) {
  const config = bases[color];
  const isOccupied = !!playerInfo;
  const canRoll = isOccupied && myColor === color && isMyTurn && !diceAnimating;

  return (
    <div id={color} className={`ludo-base ${!isOccupied ? 'is-empty' : ''}`}>
      <div className="player-info">
        {playerInfo ? (
            <>
                <div className="player-name"><b>{playerInfo.name}</b> {myColor === color && "(Vous)"}</div>
                <div className="player-cave">{Number(playerInfo.cave).toLocaleString()} Ar</div>
            </>
        ) : (
            <div className="empty-seat">Vide</div>
        )}
      </div>
      <button
        className={`ludo-die ludo-base-die ludo-base-die-${color} ${!isOccupied ? 'disabled' : ''} ${canRoll ? 'is-active' : ''}`}
        id={`die-${color}`}
        type="button"
        onClick={() => {
          if (!isOccupied) {
            toast.warn("Siège vide !");
          } else {
            onRoll(color);
          }
        }}
        aria-label={`Roll ${color} dice`}
        disabled={!isOccupied || myColor !== color || !isMyTurn || diceAnimating}
      />
      <div className={`ludo-empty-logo ludo-empty-logo-${color}`} aria-hidden={isOccupied}>
        <img src="/logo512.png" alt="" />
      </div>
      <div className="inner">
        <div className="base-row" id={`${color}_upper`}>
          {[1, 2].map((number) => (
            <div className={config.className} id={`${config.holderPrefix}${number}`} key={number}>
              <button type="button" className="ludo-token" id={`${config.tokenPrefix}${number}`} onClick={() => isOccupied && isMyTurn && myColor === color && onChoose(color, number)} aria-label={`${color} token ${number}`}>
                <img className="ludo-token-image" src={`/pions/${color}.png`} alt="" draggable="false" />
              </button>
            </div>
          ))}
        </div>
        <div className="base-row" id={`${color}_lower`}>
          {[3, 4].map((number) => (
            <div className={config.className} id={`${config.holderPrefix}${number}`} key={number}>
              <button type="button" className="ludo-token" id={`${config.tokenPrefix}${number}`} onClick={() => isOccupied && isMyTurn && myColor === color && onChoose(color, number)} aria-label={`${color} token ${number}`}>
                <img className="ludo-token-image" src={`/pions/${color}.png`} alt="" draggable="false" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MoveGrid({ id, cells }) {
  return <div id={id} className="move-grid">{cells.map(([cellId, colorClass = ""]) => <div className={`box ${colorClass}`} id={cellId} key={cellId} />)}</div>;
}

const LudoGame = () => {
  const { tableid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(null);
   const storedColor = sessionStorage.getItem(`color_${tableid}`);
   const [selectedColor, setSelectedColor] = useState(storedColor || null);
  const [joinError, setJoinError] = useState(null);
  const [diceAnimating, setDiceAnimating] = useState(false);
  const [settlementBalance, setSettlementBalance] = useState(null);
  const [chatReady, setChatReady] = useState(false);
  const engineRef = useRef(null);
  const socketRef = useRef(null);
  const tableSessionIdRef = useRef(null);
   const selectedColorRef = useRef(storedColor || null);
  const diceAnimationTimerRef = useRef(null);
  const historyHydratedRef = useRef(false);
  const winnerResetTimerRef = useRef(null);
  const boardKey = useMemo(() => Date.now(), []);

  useEffect(() => {
      const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
      const socket = io(socketUrl);
      socketRef.current = socket;
      setChatReady(true);
      socket.on('connect', () => {
          if (selectedColorRef.current) socket.emit('joinAnyTable', { tableId: String(tableid), userId: sessionStorage.getItem('userId'), playerCave: location.state?.cave, color: selectedColorRef.current });
      });
      socket.on('joinError', (data) => {
          const message = data?.message || 'Impossible de rejoindre la table';
          setJoinError(message);
          if (message.toLowerCase().includes('solde insuffisant')) {
              const userId = sessionStorage.getItem('userId');
              localStorage.removeItem(`lastTableId_${tableid}`);
              localStorage.removeItem(`lastTableId_${userId}`);
              sessionStorage.removeItem('lastTableId');
              socket.disconnect();
              navigate('/acceuil', { replace: true });
              return;
          }
          selectedColorRef.current = null;
          setSelectedColor(null);
      });
      socket.on('ludoGameFinished', (data) => {
          const updatedBalance = Number(data?.updatedBalance);
          if (Number.isFinite(updatedBalance)) {
              setSettlementBalance(updatedBalance);
              localStorage.setItem('afripoks.bankroll', String(updatedBalance));
          }

           if (data?.isWinner) {
               if (winnerResetTimerRef.current) clearTimeout(winnerResetTimerRef.current);
               winnerResetTimerRef.current = setTimeout(() => {
                   socket.emit('ludoAction', {
                       tableId: String(tableid),
                       tableSessionId: tableSessionIdRef.current,
                       action: 'resetAfterWinner',
                       data: {},
                   });
               }, 3200);
              toast.success(`Victoire ! Solde mis à jour : ${updatedBalance.toLocaleString('fr-FR')} Ar`);
              return;
          }

          toast.error(`Défaite. Solde restant : ${updatedBalance.toLocaleString('fr-FR')} Ar`);
          const userId = sessionStorage.getItem('userId');
          localStorage.removeItem(`lastTableId_${tableid}`);
          localStorage.removeItem(`lastTableId_${userId}`);
          sessionStorage.removeItem('lastTableId');
          setTimeout(() => {
              socket.disconnect();
              navigate('/acceuil', { replace: true });
          }, 1200);
      });
      socket.on('ludoQuitSuccess', () => {
          const userId = sessionStorage.getItem('userId');
          localStorage.removeItem(`lastTableId_${tableid}`);
          localStorage.removeItem(`lastTableId_${userId}`);
          sessionStorage.removeItem('lastTableId');
          socket.disconnect();
          navigate('/acceuil', { replace: true });
      });
      socket.on('soldeUpdated', (data) => {
          const updatedBalance = Number(data?.montant);
          if (!Number.isFinite(updatedBalance)) return;

          // Le serveur débite la cave à l'entrée ; garder aussi l'affichage
          // local du solde général synchronisé immédiatement.
          localStorage.setItem('afripoks.bankroll', String(updatedBalance));
      });
      socket.on('ludoGameReset', () => {
          engineRef.current?.restoreMoves([]);
          historyHydratedRef.current = true;
          toast.info('La partie a été réinitialisée.');
      });
      socket.on('ludoActionError', (data) => {
          toast.error(data?.message || 'Action Ludo refusée');
      });
      socket.on('ludoAction', (data) => {
          if (data.type === 'diceRoll') {
              setDiceAnimating(true);
              if (diceAnimationTimerRef.current) clearTimeout(diceAnimationTimerRef.current);
              diceAnimationTimerRef.current = setTimeout(() => setDiceAnimating(false), DICE_ANIMATION_DURATION);
              engineRef.current?.roll(data.color, data.diceValue);
          }
          if (data.type === 'pawnMove') {
              if (diceAnimationTimerRef.current) clearTimeout(diceAnimationTimerRef.current);
              engineRef.current?.applyRemoteMove(data.color, data.pawnNumber, data.diceValue, data.captured, data.finished);
          }
      });
      socket.on('ludoState', (data) => {
          const userId = sessionStorage.getItem('userId');
           const mySeat = data.seats.find(s => s && String(s.userId) === String(userId));
           if (mySeat) {
               sessionStorage.setItem(`color_${tableid}`, mySeat.color);
               selectedColorRef.current = mySeat.color;
               setSelectedColor(mySeat.color);
           }
          setGameState(data);
          setJoinError(null);
          tableSessionIdRef.current = data.tableSessionId || tableSessionIdRef.current;
          engineRef.current?.syncTurn(
              data.activeColor,
              data.turnOrder,
              data.lastDiceByColor?.[data.activeColor]
          );
          if (!historyHydratedRef.current && Array.isArray(data.moveHistory)) {
              engineRef.current?.restoreMoves(data.moveHistory);
              historyHydratedRef.current = true;
          }
      });
      engineRef.current = createLudoEngine(diceImages, {
          onWin: (color, finishedPawns) => {
              if (sessionStorage.getItem(`color_${tableid}`) !== color) return;
              socket.emit('ludoAction', {
                  tableId: String(tableid),
                  tableSessionId: tableSessionIdRef.current,
                  action: 'declareWinner',
                  data: { color, finishedPawns },
              });
          },
          onPawnChosen: (color, pawnNumber, captured, finished) => {
              if (sessionStorage.getItem(`color_${tableid}`) !== color) return;
              socket.emit('ludoAction', {
              tableId: String(tableid),
              tableSessionId: tableSessionIdRef.current,
              action: 'choosePawn',
              data: { color, pawnNumber, captured, finished },
              });
          },
          onTurnPassed: (color) => {
              if (sessionStorage.getItem(`color_${tableid}`) !== color) return;
              socket.emit('ludoAction', {
              tableId: String(tableid),
              tableSessionId: tableSessionIdRef.current,
              action: 'passTurn',
              data: { color },
              });
          },
          onMoveFinished: () => {
              if (diceAnimationTimerRef.current) clearTimeout(diceAnimationTimerRef.current);
              setDiceAnimating(false);
          },
      });
      return () => {
          if (diceAnimationTimerRef.current) clearTimeout(diceAnimationTimerRef.current);
          if (winnerResetTimerRef.current) clearTimeout(winnerResetTimerRef.current);
          socket.close();
          socketRef.current = null;
          setChatReady(false);
          engineRef.current = null;
      };
  }, [tableid]);



  const chooseColor = (color) => {
      if (isColorTaken(color)) {
          toast.info('Cette couleur est déjà prise par un autre joueur.');
          return;
      }
      selectedColorRef.current = color;
      setSelectedColor(color);
      setJoinError(null);
      const socket = socketRef.current;
      if (socket?.connected) socket.emit('joinAnyTable', {
          tableId: String(tableid),
          userId: sessionStorage.getItem('userId'),
          playerCave: location.state?.cave,
          color,
      });
  };

  const handleChoose = (color, number) => {
      if (!gameState?.gameStarted) return;
      engineRef.current?.choose(color, number);
  };
  const handleRoll = (color) => {
      if (diceAnimating || !gameState?.gameStarted || gameState.playersCount < 2) return;
      setDiceAnimating(true);
      if (diceAnimationTimerRef.current) clearTimeout(diceAnimationTimerRef.current);
      diceAnimationTimerRef.current = setTimeout(() => setDiceAnimating(false), DICE_ANIMATION_DURATION);
      socketRef.current?.emit('ludoAction', {
          tableId: String(tableid),
          tableSessionId: tableSessionIdRef.current,
          action: 'rollDice',
      data: { color },
  });
  };
  const handleQuit = () => {
      const seatedPlayersCount = (gameState?.seats || []).filter(Boolean).length;
      if (seatedPlayersCount >= 2 && !window.confirm('Voulez-vous vraiment quitter la partie ? Le joueur restant sera déclaré gagnant.')) return;
      socketRef.current?.emit('ludoAction', {
          tableId: String(tableid),
          tableSessionId: tableSessionIdRef.current,
          action: 'quit',
          data: {},
      });
  };
  const myColor = gameState?.yourColor || gameState?.seats?.find(s => s && String(s.userId) === String(sessionStorage.getItem("userId")))?.color;
  const isMyTurn = () => gameState?.activeColor === myColor;
  const getPlayerForColor = (color) => (gameState?.seats || []).find(s => s && s.color === color);
  const isColorTaken = (color) => Boolean(getPlayerForColor(color));
  const pairedColors = { green: 'blue', blue: 'green', red: 'yellow', yellow: 'red' };
  const firstTakenColor = ['green', 'blue', 'red', 'yellow'].find(isColorTaken);
  const isColorAllowed = (color) => !firstTakenColor || pairedColors[firstTakenColor] === color || isColorTaken(color);
  const colorStatus = (color) => {
      if (isColorTaken(color)) return getColorPlayerName(color, 'Prise');
      if (!isColorAllowed(color)) return 'Partenaire requis';
      return 'Disponible';
  };
  const getColorPlayerName = (color, fallback) => {
      const player = getPlayerForColor(color);
      return player?.name || player?.username || player?.playerName || fallback;
  };
  const activePlayer = getPlayerForColor(gameState?.activeColor);
  const activePlayerName = activePlayer?.name || activePlayer?.username || activePlayer?.playerName || 'Joueur';
  const seatedPlayersCount = (gameState?.seats || []).filter(Boolean).length;
  const turnIsReady = Boolean(gameState?.activeColor && seatedPlayersCount >= 2);
  const ludoPlayerNames = (gameState?.seats || [])
      .filter(Boolean)
      .map((seat) => seat.name || seat.username || 'Joueur');

  useEffect(() => {
      const seats = gameState?.seats || [];
      ['green', 'yellow', 'red', 'blue'].forEach((color) => {
          const die = document.getElementById(`die-${color}`);
          if (!die) return;
          const occupied = seats.some((seat) => seat && seat.color === color);
          die.disabled = diceAnimating || !occupied || myColor !== color || gameState?.activeColor !== color;
      });
  }, [diceAnimating, gameState, myColor]);
  const formatAr = (value) => Number(value || 0).toLocaleString("fr-FR");
  const tableName = "Table des Champions";
  const palette = { green: "Vert", yellow: "Jaune", red: "Rouge", blue: "Bleu" };
  // Les sièges envoyés par le serveur représentent les joueurs actuellement
  // connectés à cette partie. Aucun joueur fictif n'est affiché.
  const players = (gameState?.seats || []).filter(Boolean).map((seat) => ({
    ...seat,
    name: seat.name || seat.username || "Joueur",
    color: seat.color,
  }));
  const potValue = gameState?.totalCave ?? 0;
  const rakeValue = 10;

  return (
    <main className="ludo-game-container" key={boardKey}>
       {!myColor && !selectedColor && (
        <div className="ludo-color-selection">
          <h2>Choisissez votre couleur</h2>
          <p>{joinError || "Sélectionnez une couleur libre pour commencer."}</p>
          <div>
            <button type="button" className={`ludo-color-option green ${isColorTaken("green") ? "is-taken" : ""} ${!isColorAllowed("green") ? "is-unavailable" : ""} ${selectedColor === "green" ? "is-selected" : ""}`} onClick={() => chooseColor("green")} disabled={selectedColor === "green" || isColorTaken("green") || !isColorAllowed("green")} aria-label={`Place verte : ${colorStatus("green", "Vert")}`}>
              <span className="ludo-color-name">Vert</span><small>{colorStatus("green", "Vert")}</small>
            </button>
            <button type="button" className={`ludo-color-option yellow ${isColorTaken("yellow") ? "is-taken" : ""} ${!isColorAllowed("yellow") ? "is-unavailable" : ""} ${selectedColor === "yellow" ? "is-selected" : ""}`} onClick={() => chooseColor("yellow")} disabled={selectedColor === "yellow" || isColorTaken("yellow") || !isColorAllowed("yellow")} aria-label={`Place jaune : ${colorStatus("yellow", "Jaune")}`}>
              <span className="ludo-color-name">Jaune</span><small>{colorStatus("yellow", "Jaune")}</small>
            </button>
            <button type="button" className={`ludo-color-option blue ${isColorTaken("blue") ? "is-taken" : ""} ${!isColorAllowed("blue") ? "is-unavailable" : ""} ${selectedColor === "blue" ? "is-selected" : ""}`} onClick={() => chooseColor("blue")} disabled={selectedColor === "blue" || isColorTaken("blue") || !isColorAllowed("blue")} aria-label={`Place bleue : ${colorStatus("blue", "Bleu")}`}>
              <span className="ludo-color-name">Bleu</span><small>{colorStatus("blue", "Bleu")}</small>
            </button>
            <button type="button" className={`ludo-color-option red ${isColorTaken("red") ? "is-taken" : ""} ${!isColorAllowed("red") ? "is-unavailable" : ""} ${selectedColor === "red" ? "is-selected" : ""}`} onClick={() => chooseColor("red")} disabled={selectedColor === "red" || isColorTaken("red") || !isColorAllowed("red")} aria-label={`Place rouge : ${colorStatus("red", "Rouge")}`}>
              <span className="ludo-color-name">Rouge</span><small>{colorStatus("red", "Rouge")}</small>
            </button>
          </div>
        </div>
      )}
      <header className="ludo-topbar">
        <div className="ludo-brand"><div className="brand-pawns"><img src="/logo512.png" alt="Afripoks" /></div><div><strong>Afri<span>poks</span></strong><small>Joue · Partage · Gagne</small></div></div>
        <div className="ludo-table-title"><Crown size={26} fill="currentColor" /><strong>{tableName}</strong><button type="button" aria-label="Modifier le nom de la table"><Edit3 size={19} /></button></div>
        <button type="button" className="ludo-exit-button" onClick={handleQuit}><DoorOpen size={25} /><span>Quitter la partie</span></button>
      </header>
      <section className="ludo-main" id="main">
        <aside className="ludo-info-panel">
          <div className="ludo-stat-card"><span className="stat-icon coin-icon">◉</span><div><span>Pot actuel</span><strong>{formatAr(potValue)} <i>🪙</i></strong></div></div>
          <div className="ludo-stat-card"><span className="stat-icon percent-icon">%</span><div><span>Rake <Info size={14} /></span><strong>{rakeValue} %</strong></div></div>
          <div className={`ludo-stat-card turn-card ${turnIsReady && gameState.activeColor === myColor ? 'is-my-turn' : ''}`}><span className="stat-icon turn-icon">⟳</span><div><span>Tour actuel</span><strong><b className={`mini-dot ${gameState?.activeColor || 'blue'}`} />{activePlayerName}</strong></div></div>
          {settlementBalance !== null && <div className="ludo-settlement-balance">Votre solde : <strong>{formatAr(settlementBalance)} Ar</strong></div>}
          <div className="ludo-good-luck"><Dice5 size={68} strokeWidth={1.5} /><strong>Bonne partie !</strong><span>Que le meilleur<br />l’emporte !</span></div>
          {gameState?.yourColor && <button type="button" className="ludo-temporary-quit" onClick={handleQuit}>Quitter la partie</button>}
        </aside>
        <div className="ludo-center-column">
          <div className="ludo-board" id="board">
          <div className="board-row board-row-large" id="row1">
            <Base color="green" onChoose={handleChoose} onRoll={handleRoll} playerInfo={getPlayerForColor('green')} isMyTurn={isMyTurn()} myColor={myColor} diceAnimating={diceAnimating} />
            <MoveGrid id="yellow_move" cells={yellowMove} />
            <Base color="yellow" onChoose={handleChoose} onRoll={handleRoll} playerInfo={getPlayerForColor('yellow')} isMyTurn={isMyTurn()} myColor={myColor} diceAnimating={diceAnimating} />
          </div>
          <div className="board-row board-row-middle" id="row2">
            <MoveGrid id="green_move" cells={greenMove} /><div id="multicolor"><img src="/logo512.png" alt="Afripoks" className="ludo-logo" /></div><MoveGrid id="blue_move" cells={blueMove} />
          </div>
          <div className="board-row board-row-large" id="row3">
            <Base color="red" onChoose={handleChoose} onRoll={handleRoll} playerInfo={getPlayerForColor('red')} isMyTurn={isMyTurn()} myColor={myColor} diceAnimating={diceAnimating} />
            <MoveGrid id="red_move" cells={redMove} />
            <Base color="blue" onChoose={handleChoose} onRoll={handleRoll} playerInfo={getPlayerForColor('blue')} isMyTurn={isMyTurn()} myColor={myColor} diceAnimating={diceAnimating} />
          </div>
          <div id="out-green" className="ludo-finished-pawns ludo-finished-green" aria-label="Arrivée verte" />
          <div id="out-yellow" className="ludo-finished-pawns ludo-finished-yellow" aria-label="Arrivée jaune" />
          <div id="out-red" className="ludo-finished-pawns ludo-finished-red" aria-label="Arrivée rouge" />
          <div id="out-blue" className="ludo-finished-pawns ludo-finished-blue" aria-label="Arrivée bleue" />
          </div>
        </div>
        <aside className="ludo-players-panel">
          <div className="players-heading"><Users size={25} /><strong>Joueurs connectés</strong><span>({players.length}/2)</span></div>
          <div className="players-list">{players.map((player) => <div className={`player-card ${player.color}`} key={player.userId || player.color}><div className="player-avatar">{player.host ? <Crown size={27} fill="currentColor" /> : (player.name || "J").charAt(0)}</div><div className="player-details"><strong>{player.name}</strong><span><i className={`mini-dot ${player.color}`} />{palette[player.color] || player.color}</span></div>{player.host && <em>Hôte</em>}<b className="player-coins">🪙 {formatAr(player.cave)}</b><Menu size={20} className="player-menu" /></div>)}</div>
          <div className="table-name-card"><div><Gem size={25} /><strong>Nom de la table</strong></div><p>{tableName}</p><Edit3 size={18} /></div>
          <div className="ludo-motto"><span>━━</span><Crown size={24} fill="currentColor" /><span>━━</span><small>Ludo, plus qu’un jeu !</small></div>
        </aside>
      </section>
      {chatReady && (
        <TableChat
          socketRef={socketRef}
          tableId={tableid}
          tableState={gameState}
          currentUserId={sessionStorage.getItem('userId')}
          playerNames={ludoPlayerNames}
        />
      )}
    </main>
  );
};

export default LudoGame;
