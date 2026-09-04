import { useEffect, useState, useContext } from "react";
import Nav from "../../component/nav/Nav";
import Game from "../../component/game/Game";
import PlayerActions from "../../component/game/PlayerActions";
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import { getById } from "../../services/tableServices";
import { getSolde } from "../../services/soldeService";
import { JoinedTableContext } from "../../contexts/JoinedTableContext";
import InfoIcon from '@mui/icons-material/Info';
import { Users, Wallet, RotateCcw } from 'lucide-react';

import "./GameTable.scss";

const GameTable = () => {
    // ... (rest of the state declarations)
    const [actionHandlers, setActionHandlers] = useState(null);
    // Adding placeholder for lastTable/sitCounts for integration
    const lastTable = null; // Replace with actual logic to fetch last table
    const sitCounts = new Map(); // Replace with actual sit counts
    const openCaveModal = (table) => { /* Implement modal logic */ };
    const { tableid } = useParams();
    const { tableSessionIdShared } = useParams();
    const [tableSessionId, setTableSessionId] = useState();
    
    useEffect(() => {
        if (tableid) {
            sessionStorage.setItem('lastTableId', String(tableid));
        }
    }, [tableid]);

    const navigate = useNavigate();
    const { joinedTables } = useContext(JoinedTableContext);

    const [cavePlayer, setCavePlayer] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showGuideModal, setShowGuideModal] = useState(false);
    const [userBalance, setUserBalance] = useState(0);
    const routeLocation = useLocation();
    const userId = sessionStorage.getItem('userId');
    const user = JSON.parse(localStorage.getItem('afripoks.user'));
    const pseudo = user?.name || "Joueur";

    useEffect(() => {
        if (userId && userId !== "null" && userId !== "undefined") {
            getSolde(userId, setUserBalance).catch(console.error);
        }
    }, [userId]);

    const handleAvatarClick = () => {
        setShowProfileModal(true);
    };

    const handleGuideClick = () => {
        setShowGuideModal(true);
    };

    useEffect(() => {
        const userId = sessionStorage.getItem('userId');
        
        const initGame = async () => {
            const isRejoin = routeLocation.state?.isRejoin || joinedTables.includes(parseInt(tableid));

            // 1. Vérifier le solde (seulement si ce n'est pas un rejoin)
            if (userId && userId !== "null" && userId !== "undefined" && !isRejoin) {
                try {
                    let currentSolde = 0;
                    await getSolde(userId, (val) => currentSolde = val);
                    if (Number(currentSolde) <= 0) {
                        toast.error("Solde insuffisant pour jouer !");
                        navigate('/acceuil');
                        return;
                    }
                } catch (error) {
                    console.error("Erreur lors de l'initialisation du jeu (solde):", error);
                    toast.error("Erreur lors de la récupération de votre solde. Veuillez vous reconnecter.");
                    navigate('/acceuil');
                    return;
                }
            } else if (!isRejoin && (!userId || userId === "null" || userId === "undefined")) {
                toast.error("Utilisateur non identifié. Veuillez vous reconnecter.");
                navigate('/acceuil');
                return;
            }

            // 2. Charger la cave
            if (isRejoin) {
                setCavePlayer(0);
            } else if (routeLocation.state?.cave) {
                setCavePlayer(Number(routeLocation.state.cave));
            } else {
                try {
                    const minCave = await getById(tableid);
                    const cave = Number(minCave);
                    setCavePlayer(cave);
               
                } catch (e) {
                    toast.error("Erreur de chargement de la table.");
                }
            }
        };
        initGame();
    }, [routeLocation, tableid, navigate, joinedTables]);

    return (
        <>
            <ToastContainer />
            {showProfileModal && (
                <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="avatar-big">👤</div>
                            <h2>{pseudo}</h2>
                        </div>
                        <div className="modal-body">
                            <div className="stat-item">
                                <span className="label">Solde</span>
                                <span className="value">{userBalance.toLocaleString("fr-FR")} Ar</span>
                            </div>
                            <div className="stat-item">
                                <span className="label">ID</span>
                                <span className="value">{userId}</span>
                            </div>
                        </div>
                        <button className="close-btn" onClick={() => setShowProfileModal(false)}>Fermer</button>
                    </div>
                </div>
            )}
            
            {showGuideModal && (
                <div className="modal-overlay" onClick={() => setShowGuideModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>Guide de la Table</h2>
                        <div className="modal-body" style={{ textAlign: 'left' }}>
                            <p>• <b>Auto-quitter :</b> Si vous ne recavez pas après 10 secondes, vous serez automatiquement retiré de la table.</p>
                            <p>• <b>Restriction :</b> Vous ne pouvez pas quitter la table avant 45 minutes.</p>
                            <p>• <b>Rake :</b> Le rake calculé est de 5 %.</p>
                        </div>
                        <button className="close-btn" onClick={() => setShowGuideModal(false)}>Fermer</button>
                    </div>
                </div>
            )}
            <div className="table-container" style={{ position: 'relative', minHeight: '100vh', display: 'flex', justifyContent: 'center', backgroundColor: '#2c0000' }}> 
                <div className="tp-pillar left"></div>
                <div className="tp-pillar right"></div>
                
                {/* Image de fond centrée, entre les rideaux */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: '15vw',  /* Même largeur que les rideaux */
                    right: '15vw', /* Même largeur que les rideaux */
                    backgroundImage: 'url("/table-bg.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 0
                }} />
                
                {/* Boutons gauche */}
                <div className="left-menu">
                    <div className="left-action">
                        {actionHandlers && <PlayerActions {...actionHandlers} />}
                    </div>
                    <br/>
                    <button className="avatar-btn" onClick={handleAvatarClick}>👩</button>
                    <button className="small-btn" onClick={handleGuideClick}><InfoIcon /></button>
                </div>
                
                {lastTable && (
                    <div className="rejoin-banner" style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
                        {/* ... */}
                    </div>
                )}

                <div className="game-content" style={{ position: 'relative', width: '100%', zIndex: 1 }}>
                    {cavePlayer !== null && (
                        <Game
                        key={tableid}
                        tableId={tableid}
                        tableSessionIdShared={tableSessionIdShared}
                        setTableSessionId={setTableSessionId}
                        cavePlayer={cavePlayer}
                        onlyTable={!tableSessionIdShared}
                        onActionsReady={setActionHandlers}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default GameTable;