import { useEffect, useState, useContext } from "react";
import Nav from "../../component/nav/Nav";
import Game from "../../component/game/Game";
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import { getById } from "../../services/tableServices";
import { getSolde } from "../../services/soldeService";
import { JoinedTableContext } from "../../contexts/JoinedTableContext";

import "./GameTable.scss";

const GameTable = () => {
    const { tableid } = useParams();
    const { tableSessionIdShared } = useParams();
    const [tableSessionId, setTableSessionId] = useState();
    const navigate = useNavigate();
    const { joinedTables } = useContext(JoinedTableContext);

    const [cavePlayer, setCavePlayer] = useState(null);
    const routeLocation = useLocation();

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
                    <button className="avatar-btn">👩</button>
                    <button className="small-btn">☰</button>
                    
                </div>

                <div className="game-content" style={{ position: 'relative', width: '100%', zIndex: 1 }}>
                    {cavePlayer !== null && (
                        <Game
                        key={tableid}
                        tableId={tableid}
                        tableSessionIdShared={tableSessionIdShared}
                        setTableSessionId={setTableSessionId}
                        cavePlayer={cavePlayer}
                        onlyTable={!tableSessionIdShared}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default GameTable;